export async function POST(req: NextRequest) {
  const body = await req.text()
  const hash = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
                     .update(body).digest("hex")

  if (hash !== req.headers.get("x-paystack-signature")) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const event = JSON.parse(body)
  if (event.event === "charge.success") {
    const { reference, metadata } = event.data
    await prisma.payment.update({
      where: { reference },
      data: { status: "success", paidAt: new Date() }
    })
    await prisma.eCGUpload.update({
      where: { id: metadata.ecgUploadId },
      data: { status: "PAID" }
    })
    // Auto-create a case and notify admins
    await prisma.case.create({
      data: { ecgUploadId: metadata.ecgUploadId, priority: "STANDARD" }
    })
  }

  return NextResponse.json({ received: true })
}