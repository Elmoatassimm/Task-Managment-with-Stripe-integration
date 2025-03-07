<?php




namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Illuminate\Http\JsonResponse;
use Stripe\Exception\ApiErrorException;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class StripeController extends Controller
{
    public function createPaymentIntent(): JsonResponse
    {


        // Check if the user already completed a successful payment

        $existingPayment = Payment::where('user_id', Auth::id())
            ->where('status', 'success')
            ->first();

        if ($existingPayment) {
            return response()->json([
                'message' => 'User already paid'
            ], 400);
        }

        try {







            // Set Stripe API key

            Stripe::setApiKey(env("STRIPE_SECRET_KEY"));

            // Create a payment intent with a fixed amount (e.g., $1.00 in cents)
            $paymentIntent = PaymentIntent::create([
                'amount' => 100,
                'currency' => 'usd',
                'payment_method_types' => ['card'],
                'metadata' => [
                    'user_id' => Auth::id()
                ]
            ]);


            $clientSecret = $paymentIntent->client_secret;
            $paymentIntentId = $paymentIntent->id;




            // Create and store a new payment record with a "pending" status.
            $payment = Payment::create([
                'user_id' => Auth::id(),
                'payment_intent_id' => $paymentIntentId,

                'status' => 'pending'
            ]);


            return response()->json([
                'clientSecret' => $clientSecret,
                'paymentIntentId' => $paymentIntentId
            ]);
        } catch (\Exception $e) {
            // Return a JSON error response if something goes wrong.
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }



    public function handleWebhook(Request $request)
    {
        // Set Stripe API key
        Stripe::setApiKey(env('STRIPE_SECRET_KEY'));

        // Retrieve webhook payload
        $payload = @file_get_contents('php://input');
        $event = null;

        try {
            // Construct event from JSON payload
            $event = \Stripe\Event::constructFrom(
                json_decode($payload, true)
            );
        } catch (\UnexpectedValueException $e) {
            // Return error response if payload is invalid
            return response()->json(['error' => 'Invalid payload'], 400);
        }

        // Process different webhook event types
        switch ($event->type) {
            case 'payment_intent.succeeded':
                // Update payment status to 'success' if payment was successful
                $paymentIntent = $event->data->object;
                $payment = Payment::where('payment_intent_id', $paymentIntent->id)->first();
                if ($payment) {
                    $payment->update(['status' => 'success']);
                }
                break;

            case 'payment_intent.payment_failed':
                // Update payment status to 'failed' if payment failed
                $paymentIntent = $event->data->object;
                $payment = Payment::where('payment_intent_id', $paymentIntent->id)->first();
                if ($payment) {
                    $payment->update(['status' => 'failed']);
                }
                break;
        }

        return response()->json(['message' => 'Webhook processed successfully'], 200);
    }
}
