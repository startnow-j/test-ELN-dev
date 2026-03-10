import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth'
import { AuditAction } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码不能为空' },
        { status: 400 }
      )
    }

    // 查找用户
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      )
    }

    // 验证密码
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      )
    }

    // 生成token
    const token = generateToken(user.id)

    // 记录审计日志（不阻塞登录流程）
    try {
      await db.auditLog.create({
        data: {
          action: AuditAction.LOGIN,
          entityType: 'User',
          entityId: user.id,
          userId: user.id,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        }
      })
    } catch (auditError) {
      console.error('Audit log error:', auditError)
    }

    // 设置cookie
    const isDev = process.env.NODE_ENV !== 'production'
    
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
      token, // 返回token用于跨域场景
    })
    
    // 设置cookie - 开发环境使用更宽松的设置
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: !isDev, // 开发环境不使用secure
      sameSite: isDev ? 'lax' : 'strict', // 开发环境使用lax
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: '登录失败，请重试' },
      { status: 500 }
    )
  }
}
