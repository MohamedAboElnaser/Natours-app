/* eslint-disable */
import {showAlert} from './alerts.mjs';

const stripe = Stripe(
  'pk_test_51NgoL0GW9VZ6XwxsBOSqaCI29rhOuJcRshzFa2nfx121DL9qU1gJaY99cPx9iCl6XDKZHZzv0d8jw0BAVtktZMCI00dwASdakA'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`http://localhost:8000/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
