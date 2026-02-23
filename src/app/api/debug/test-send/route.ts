import { NextResponse } from 'next/server';
import { whatsappService } from '@/services/whatsapp.service';

// GET /api/debug/test-send?instance=wa_4da01f1f&phone=559885891003&msg=Teste
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const instance = searchParams.get('instance');
        const phone = searchParams.get('phone');
        const msg = searchParams.get('msg') || 'Olá! Teste do agente IA 🤖';

        if (!instance || !phone) {
            return NextResponse.json({ error: 'Parâmetros obrigatórios: instance, phone' }, { status: 400 });
        }

        const result = await whatsappService.sendMessage(instance, phone, msg);
        return NextResponse.json({ success: true, result });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            details: error.response?.data || null
        }, { status: 500 });
    }
}
