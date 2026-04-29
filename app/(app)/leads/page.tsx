import { getLeads } from "./actions"
import LeadsClient from "./LeadsClient"

export default async function LeadsPage() {
  const leads = await getLeads()
  return <LeadsClient initialLeads={leads} />
}
