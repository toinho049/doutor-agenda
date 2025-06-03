import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { db } from "@/db";
import { usersTable } from "@/db/schema";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature") as string;
  const rawBody = await req.text(); // <-- Aqui está a correção!

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "invoice.paid": {
      const invoice = event.data.object as any;

      // Corrija aqui:
      const subscription = invoice.parent?.subscription_details?.subscription;
      const userId = invoice.parent?.subscription_details?.metadata?.userId;
      const customer = invoice.customer;

      if (!subscription) {
        console.error("Stripe invoice.paid sem subscription:", invoice);
        return NextResponse.json(
          { error: "Subscription not found" },
          { status: 200 }
        );
      }
      if (!userId) {
        console.error("Stripe invoice.paid sem userId:", invoice);
        return NextResponse.json(
          { error: "UserId not found" },
          { status: 200 }
        );
      }

      console.log("Atualizando usuário:", { userId, subscription, customer });

      const result = await db
        .update(usersTable)
        .set({
          stripeSubscriptionId: subscription,
          stripeCustomerId: customer,
          plan: "essential",
        })
        .where(eq(usersTable.id, userId));

      console.log("Resultado do update:", result);

      break;
    }
    case "customer.subscription.deleted": {
      if (!event.data.object.id) {
        throw new Error("Subscription ID not found");
      }
      const subscription = await stripe.subscriptions.retrieve(
        event.data.object.id
      );
      if (!subscription) {
        throw new Error("Subscription not found");
      }
      const userId = subscription.metadata.userId;
      if (!userId) {
        throw new Error("User ID not found");
      }
      await db
        .update(usersTable)
        .set({
          stripeSubscriptionId: null,
          stripeCustomerId: null,
          plan: null,
        })
        .where(eq(usersTable.id, userId));
    }
  }
  return NextResponse.json({
    received: true,
  });
}
