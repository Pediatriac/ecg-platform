 // app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [
      totalUsers,
      totalPatients,
      totalDoctors,
      totalCases,
      completedCases,
      pendingCases,
      totalPayments,
      recentPayments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "PATIENT" } }),
      prisma.user.count({ where: { role: "DOCTOR" } }),
      prisma.case.count(),
      prisma.case.count({ where: { ecgUpload: { status: "COMPLETED" } } }),
      prisma.case.count({
        where: {
          ecgUpload: {
            status: { in: ["PAID", "ASSIGNED", "IN_REVIEW"] },
          },
        },
      }),
      prisma.payment.aggregate({
        where: { status: "success" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.payment.findMany({
        where: { status: "success" },
        orderBy: { paidAt: "desc" },
        take: 5,
        include: { user: true, ecgUpload: { include: { patient: true } } },
      }),
    ])

    return NextResponse.json({
      stats: {
        totalUsers,
        totalPatients,
        totalDoctors,
        totalCases,
        completedCases,
        pendingCases,
        totalRevenue: totalPayments._sum.amount || 0,
        totalTransactions: totalPayments._count,
      },
      recentPayments,
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
