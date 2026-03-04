"use client";

import { Box, Lock, Search, Settings, Sparkles } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

export function GlowingEffectDemo() {
    return (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-12 md:auto-rows-[14rem] lg:gap-6">
            <GridItem
                area="md:[grid-area:1/1/2/7] lg:[grid-area:1/1/2/5]"
                icon={<Box className="h-5 w-5 text-primary" />}
                title="Gestão Inteligente"
                description="Agende horários de forma automática e reduza faltas com lembretes."
            />
            <GridItem
                area="md:[grid-area:1/7/2/13] lg:[grid-area:2/1/3/5]"
                icon={<Settings className="h-5 w-5 text-primary" />}
                title="Configuração Rápida"
                description="Personalize seus serviços e horários em poucos cliques."
            />
            <GridItem
                area="md:[grid-area:2/1/3/7] lg:[grid-area:1/5/3/9]"
                icon={<Lock className="h-5 w-5 text-primary" />}
                title="Segurança Total"
                description="Seus dados e de seus clientes protegidos com criptografia de ponta."
            />
            <GridItem
                area="md:[grid-area:2/7/3/13] lg:[grid-area:1/9/2/13]"
                icon={<Sparkles className="h-5 w-5 text-primary" />}
                title="Experiência Premium"
                description="Ofereça um atendimento diferenciado desde o primeiro contato."
            />
            <GridItem
                area="md:[grid-area:3/1/4/13] lg:[grid-area:2/9/3/13]"
                icon={<Search className="h-5 w-5 text-primary" />}
                title="Fácil Localização"
                description="Seja encontrado por novos clientes na sua região."
            />
        </ul>
    );
}

interface GridItemProps {
    area: string;
    icon: React.ReactNode;
    title: string;
    description: React.ReactNode;
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
    return (
        <li className={cn("min-h-[14rem] list-none", area)}>
            <div className="relative h-full rounded-[1.25rem] border border-border p-2 md:rounded-[1.5rem] md:p-3">
                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={3}
                />
                <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border bg-background p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-8">
                    <div className="relative flex flex-1 flex-col justify-between gap-4">
                        <div className="w-fit rounded-lg border border-border bg-muted p-2.5">
                            {icon}
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                                {title}
                            </h3>
                            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                                {description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
};
