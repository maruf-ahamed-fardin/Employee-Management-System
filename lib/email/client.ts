export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const emailClient = {
  async send(options: EmailOptions): Promise<boolean> {
    // In dev / production without external SMTP, logs email payload
    console.log(`[EMAIL DISPATCH] To: ${options.to} | Subject: ${options.subject}`);
    return true;
  },
};
