export const saasConfig = {
    name: "AgendamentoIA",
    description: "Agente IA para WhatsApp que agenda automaticamente",

    theme: {
        primary: "#8B5CF6",
        secondary: "#EC4899",
        background: "#FFFFFF",
        text: "#1F2937",
        font: "Inter, sans-serif"
    },

    modules: [
        {
            name: "authentication",
            config: {
                providers: ["email", "google"],
                redirectAfterLogin: "/dashboard",
                redirectAfterLogout: "/",
                emailVerification: true,
                passwordReset: true,
                sessionTimeout: 30
            }
        },
        {
            name: "subscription",
            config: {
                plans: [
                    {
                        id: "essential",
                        name: "Essencial",
                        price: 97,
                        currency: "BRL",
                        interval: "month",
                        features: [
                            "max_connections:1",
                            "max_conversations:100",
                            "agent_type:basic",
                            "google_calendar:true",
                            "support:email"
                        ],
                        trial_days: 7
                    },
                    {
                        id: "professional",
                        name: "Profissional",
                        price: 197,
                        currency: "BRL",
                        interval: "month",
                        features: [
                            "max_connections:2",
                            "max_conversations:500",
                            "agent_type:advanced",
                            "google_calendar_plus:true",
                            "multiple_professionals:true",
                            "advanced_reports:true",
                            "priority_support:true",
                            "api_access:true"
                        ],
                        trial_days: 7
                    },
                    {
                        id: "business",
                        name: "Empresarial",
                        price: 397,
                        currency: "BRL",
                        interval: "month",
                        features: [
                            "max_connections:5",
                            "conversations:unlimited",
                            "agent_type:premium",
                            "multiple_calendars:true",
                            "teams:true",
                            "custom_integrations:true",
                            "success_manager:true",
                            "sla:true"
                        ],
                        trial_days: 0
                    }
                ],
                payment_gateway: "stripe",
                webhook_url: "/api/webhooks/stripe"
            }
        }
    ],

    routes: {
        public: ["/", "/pricing", "/blog", "/terms", "/privacy", "/contact"],
        private: ["/dashboard", "/dashboard/*", "/settings", "/billing"],
        admin: ["/admin/*"]
    },

    emails: {
        welcome: {
            subject: "Bem-vindo ao AgendamentoIA!",
            template: "emails/welcome.html"
        },
        trial_ending: {
            subject: "Seu trial está terminando",
            template: "emails/trial-ending.html",
            days_before: 2
        },
        appointment_confirmation: {
            subject: "Novo agendamento confirmado!",
            template: "emails/appointment-confirmation.html"
        },
        whatsapp_disconnected: {
            subject: "WhatsApp desconectado",
            template: "emails/whatsapp-disconnected.html"
        }
    }
};
