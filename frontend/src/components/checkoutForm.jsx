
import Toast from "./Toast";
import apiFetch from "../apiFetch";
import { useNavigate, Link } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Make sure to replace this with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/app/dashboard`,
      },
      redirect: 'if_required'
    });

    if (error) {
      setMessage(error.message);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setMessage('Payment succeeded!');
      // You can navigate immediately or after a delay
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 2000);
      
    } else {
      setMessage('Unexpected state');
    }

    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {// Toast Notification for payment status 
      }
      <Toast
        message={message}
        success={message && message.includes('succeeded')}
        onClose={() => setMessage(null)}
      />

      <div className="w-96 bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Payment Details</h2>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">Test Card Numbers:</h3>
          <p className="text-sm">✅ Success: 4242 4242 4242 4242</p>
          <p className="text-sm">❌ Decline: 4000 0000 0000 0002</p>
          <p className="text-sm text-blue-600">Use any future date and CVC</p>
        </div>

        <form onSubmit={handleSubmit}>
          <PaymentElement />
          
          <button 
            type="submit"
            disabled={isProcessing || !stripe || !elements}
            className={`
              mt-6 w-full py-3 px-4 rounded-lg
              ${isProcessing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'} 
              text-white font-medium transition-colors
            `}
          >
            {isProcessing ? 'Processing...' : 'Pay now'}
          </button>
        </form>
      </div>
    </div>
  );
};

const PaymentWrapper = () => {
  const [clientSecret, setClientSecret] = useState('');
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('create-payment-intent', { method: 'GET', auth: true })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "User already paid") {
          setMessage("User already paid");
          setTimeout(() => {
            navigate("/app/dashboard");
          }, 2000);
        } else {
          setClientSecret(data.clientSecret);
        }
      })
      .catch((err) => {
        console.error('Error:', err);
        setMessage("An error occurred while creating the payment intent");
      });
  }, [navigate]);
  
  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#2563eb',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#dc2626',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    }
  };

  const options = {
    clientSecret,
    appearance,
  };

  return clientSecret ? (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  ) : (
    <div className="min-h-screen flex justify-center items-center">
      {//Optional Toast in PaymentWrapper for messages like "User already paid"
       }
      {message && (
        <Toast
          message={message}
          success={message.includes('paid')}
          onClose={() => setMessage(null)}
        />
      )}
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );
}

export default PaymentWrapper;

