export async function POST(req: NextRequest) {
  const { ecgUploadId, tier } = await req.json()
  const session = await getServerSession()

  const amounts = { STANDARD: 1000000, URGENT: 1500000, DETAILED: 2000000 } // kobo
  const reference = `ECG-${Date.now()}-${Math.random().toString(36).slice(2)}`

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: session.user.email,
      amount: amounts[tier],
      reference,
      callback_url: `${process.env.NEXTAUTH_URL}/dashboard/cases`,
      metadata: { ecgUploadId }
    })
  })

  const data = await res.json()

  await prisma.payment.create({
    data: { ecgUploadId, userId: session.user.id, amount: amounts[tier], reference }
  })

  return NextResponse.json({ authorization_url: data.data.authorization_url })
}