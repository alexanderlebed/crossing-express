export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "SRIM Intelligence Report",
              description: "Full sovereign relocation intelligence modeling including jurisdictional feasibility, legal pathways, economic sustainability and risk vectors."
            },
            unit_amount: 24900 // €249
          },
          quantity: 1
        }
      ],
      success_url: `${req.headers.origin}/portal.html`,
      cancel_url: `${req.headers.origin}/report.html`
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {

    return res.status(500).json({ error: err.message });

  }
}
