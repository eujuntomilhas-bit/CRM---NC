import { getDeals } from "./actions"
import { getLeads } from "@/app/(app)/leads/actions"
import PipelineClient from "./PipelineClient"

export default async function PipelinePage() {
  const [deals, leads] = await Promise.all([
    getDeals(),
    getLeads(),
  ])

  const leadRefs = leads.map((l) => ({ id: l.id, name: l.name }))

  return <PipelineClient initialDeals={deals} leads={leadRefs} />
}
