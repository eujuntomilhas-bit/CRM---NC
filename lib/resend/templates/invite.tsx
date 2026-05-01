type InviteEmailProps = {
  workspaceName: string
  inviterName: string
  acceptUrl: string
}

export function buildInviteEmailHtml({ workspaceName, inviterName, acceptUrl }: InviteEmailProps): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Convite para ${escapeHtml(workspaceName)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 16px;">
    <tbody>
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <tbody>
              <tr>
                <td style="background-color:#18181b;padding:32px 40px 24px;">
                  <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">CRM-NC</p>
                </td>
              </tr>
              <tr>
                <td style="padding:32px 40px;">
                  <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#18181b;line-height:1.3;">Você foi convidado</h1>
                  <p style="margin:0 0 24px;font-size:15px;color:#52525b;line-height:1.6;">
                    <strong style="color:#18181b;">${escapeHtml(inviterName)}</strong> convidou você para colaborar no workspace
                    <strong style="color:#18181b;">${escapeHtml(workspaceName)}</strong>.
                  </p>
                  <p style="margin:0 0 32px;font-size:14px;color:#71717a;line-height:1.6;">
                    Clique no botão abaixo para aceitar o convite. O link expira em 7 dias.
                  </p>
                  <table cellpadding="0" cellspacing="0">
                    <tbody>
                      <tr>
                        <td>
                          <a href="${escapeHtml(acceptUrl)}" style="display:inline-block;background-color:#18181b;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;">
                            Aceitar convite
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <p style="margin:24px 0 0;font-size:12px;color:#a1a1aa;">Se o botão não funcionar, copie e cole este link no navegador:</p>
                  <p style="margin:4px 0 0;font-size:12px;word-break:break-all;">
                    <a href="${escapeHtml(acceptUrl)}" style="color:#3b82f6;">${escapeHtml(acceptUrl)}</a>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="border-top:1px solid #f4f4f5;padding:20px 40px;background-color:#fafafa;">
                  <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center;">
                    Se você não esperava este convite, pode ignorar este e-mail com segurança.
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
