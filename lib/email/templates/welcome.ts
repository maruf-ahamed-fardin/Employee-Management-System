export function welcomeEmailTemplate(name: string, tempPass: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #252175; font-weight: 800;">Welcome to Selora<span style="color: #f37021;">X</span> EMS</h2>
      <p>Hello ${name},</p>
      <p>Your employee account has been created. Here are your sign-in details:</p>
      <div style="background: #f4f4f8; padding: 15px; border-radius: 6px; font-family: monospace;">
        Temporary Password: <strong>${tempPass}</strong>
      </div>
      <p>Please log in and update your password immediately.</p>
    </div>
  `;
}
