# Mini's Art Gallery — Premium Art Shop

This version turns the original gallery into an Etsy/Instagram-style storefront with:
- ₹ pricing
- Product catalogue
- Quantity controls
- Shopping bag/cart
- Product details
- Flat-rate shipping + free-shipping threshold
- UPI payment intent checkout
- Payment/reference ID collection
- Online order submission
- Supabase-backed order database
- Password-protected admin dashboard
- Order status management
- Responsive mobile design

## Files
- `index.html` — customer storefront + cart + checkout
- `shop.js` — catalogue, cart and checkout logic
- `config.js` — YOUR store settings
- `admin.html` — admin login and order dashboard
- `schema.sql` — database/RLS setup for Supabase
- `style.css` — design
- `images/` — the two artworks you supplied

## Before publishing: 3 things you must configure

### 1. Put your real UPI ID in `config.js`
Change:
`upiId: "YOUR-UPI-ID@bank"`

to your actual UPI ID, for example:
`upiId: "yourname@upi"`

Also change `upiName` if you want a different display name.

### 2. Set up Supabase
Create a Supabase project, open its SQL Editor, and run the complete contents of `schema.sql`.

Then create an admin user in Supabase Authentication (email/password).

Copy your project's:
- Project URL
- anon/public key

into `config.js`:
`supabaseUrl: "..."`
`supabaseAnonKey: "..."`

Do NOT put a Supabase service-role/secret key in this website.

The RLS rules allow customers to INSERT an order but prevent anonymous users from reading other customers' orders. Signed-in users can read/update orders through the admin dashboard.

### 3. Replace the example prices
Current example prices:
- Krishna-Inspired Portrait — ₹1,499
- Sacred Symbol Mandala — ₹1,899

Edit prices and product information in `shop.js`.

Shipping is currently:
- ₹99 below ₹2,500
- FREE at/above ₹2,500

Edit these values in `config.js`.

## UPI checkout note
This site creates a standard `upi://pay` intent. On a compatible mobile device it can open a UPI app with the amount pre-filled.

The site does NOT independently verify a bank payment. The customer enters their UPI transaction/reference ID, which is stored with the order. For automatic payment verification, connect a payment gateway such as Razorpay/PayU/Cashfree on the server side.

## Admin
Open `admin.html` after deployment.
Sign in with the Supabase Auth admin account.
You can see:
- Order number
- Customer details
- Items and quantities
- Total
- UPI reference
- Order status
- Date/time

Statuses can be changed to:
Payment submitted → Confirmed → Packed → Shipped → Completed
or Cancelled.

## Important production recommendations
1. Use a custom domain.
2. Add a proper payment gateway if you want automatic payment verification.
3. Add a privacy policy, terms, refund/cancellation policy and shipping policy before taking live orders.
4. Confirm local tax/GST obligations for your situation with a qualified professional.
5. Consider collecting only the customer information actually needed for fulfilment.

## Deploy
This is a static site and can be deployed on Netlify, Vercel, GitHub Pages (with a suitable Supabase setup), Cloudflare Pages, etc.

For the easiest route:
1. Upload this folder to a GitHub repository.
2. Import the repository into Netlify/Vercel.
3. Add your domain.
4. Put the Supabase and UPI values in `config.js`.
5. Test one small order from a phone before sharing the site publicly.

## Adding new artwork
Add an image under `images/`, then add a product object to the `PRODUCTS` array in `shop.js` with:
id, title, category, price, image, description, size.

No changes to the cart code are required.
