import API from "./api";

class PaymentService {
  // Get Razorpay public key
  static async getRazorpayKey() {
    try {
      const response = await API.get('/payment/key');
      return response.data;
    } catch (error) {
      console.error('Error fetching Razorpay key:', error);
      throw error;
    }
  }

  // Create Razorpay order
  static async createOrder(amount) {
    try {
      const response = await API.post('/payment/create-order', { amount });
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Verify payment
  static async verifyPayment(paymentData) {
    try {
      const response = await API.post('/payment/verify', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  // Initialize Razorpay checkout
  static async initializePayment(orderData, user, options = {}) {
    try {
      // Get Razorpay key
      const { key } = await this.getRazorpayKey();
      
      // Create order
      const { order } = await this.createOrder(orderData.totalAmount);
      
      return new Promise((resolve, reject) => {
        const razorpay = new window.Razorpay({
          key_id: key,
          amount: order.amount,
          currency: order.currency,
          name: 'PARIVA Jewellery',
          description: 'Order Payment',
          order_id: order.id,
          handler: async (response) => {
            try {
              // Verify payment
              const verificationData = {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData: {
                  ...orderData,
                  user: user._id,
                  totalAmount: orderData.totalAmount
                }
              };

              const result = await this.verifyPayment(verificationData);
              
              if (result.success) {
                resolve({
                  success: true,
                  orderId: result.orderId,
                  paymentId: response.razorpay_payment_id
                });
              } else {
                reject(new Error(result.message || 'Payment verification failed'));
              }
            } catch (error) {
              reject(error);
            }
          },
          modal: {
            ondismiss: () => {
              reject(new Error('Payment cancelled by user'));
            },
            escape: false,
            backdropclose: false
          },
          prefill: {
            name: user.name || '',
            email: user.email || '',
            contact: user.mobile || ''
          },
          theme: {
            color: '#d4af37'
          },
          ...options
        });

        razorpay.open();
      });
    } catch (error) {
      console.error('Error initializing payment:', error);
      throw error;
    }
  }
}

export default PaymentService;
