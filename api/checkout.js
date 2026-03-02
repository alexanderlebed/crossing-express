import Stripe from "stripe";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "Stripe key not configured" });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "SRIM Intelligence Report",
              description: "Sovereign Relocation Intelligence Modeling — structured geopolitical, legal and economic relocation architecture."
            },
            unit_amount: 24900 // €249
          },
          quantity: 1
        }
      ],
      success_url: `${req.headers.origin}/success.html`,
      cancel_url: `${req.headers.origin}/`
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {

    return res.status(500).json({
      error: err.message || "Stripe session creation failed"
    });

  }
}
