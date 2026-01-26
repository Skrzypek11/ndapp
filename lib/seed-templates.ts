"use server"

import { prisma } from "@/lib/prisma"

const DEFAULT_TEMPLATES = [
    {
        name: 'Surveillance Log',
        description: 'Standard observation log for suspect tracking.',
        type: 'REPORT',
        content: `<h2>Surveillance Log</h2><p><strong>Target:</strong> [Name]</p><p><strong>Location:</strong> [Address]</p><p><strong>Start Time:</strong> 00:00</p><p><strong>End Time:</strong> 00:00</p><h3>Observations</h3><ul><li>entry 1...</li></ul>`
    },
    {
        name: 'Arrest Report',
        description: 'For documenting suspect apprehension and rights redaction.',
        type: 'REPORT',
        content: `<h2>Arrest Report</h2><p><strong>Suspect:</strong> [Name]</p><p><strong>Charges:</strong> [List]</p><h3>Narrative</h3><p>Suspect was apprehended at...</p><h3>Miranda Rights</h3><p>Read at: [Time]</p>`
    },
    {
        name: 'Seizure Protocol',
        description: 'Chain of custody and itemized list of seized goods.',
        type: 'REPORT',
        content: `<h2>Seizure Protocol</h2><p><strong>Location:</strong> [Address]</p><h3>Items Seized</h3><ul><li>Item 1 (Qty)</li><li>Item 2 (Qty)</li></ul><h3>Chain of Custody</h3><p>Evidence bagged and tagged by...</p>`
    },
    {
        name: 'Incident Report',
        description: 'General purpose incident documentation.',
        type: 'REPORT',
        content: `<h2>Incident Report</h2><p><strong>Type:</strong> [Type]</p><p><strong>Involved Parties:</strong> [Names]</p><h3>Description</h3><p>Detailed description of events...</p>`
    },
    {
        name: 'Case Dossier',
        description: 'Structure for opening a new case file.',
        type: 'CASE',
        content: `<h2>Case Dossier</h2><p><strong>Objective:</strong> [Objective]</p><h3>Background</h3><p>Context about the investigation...</p><h3>Targets</h3><ul><li>Target 1</li></ul>`
    },
    {
        name: 'Standard Protocol',
        description: 'General layout for operational protocols.',
        type: 'KOMPENDIUM',
        content: `<h2>Protocol Title</h2><p><strong>Purpose:</strong> [Purpose]</p><h3>Steps</h3><ol><li>Step 1</li></ol>`
    }
]

export async function seedTemplates() {
    const count = await prisma.template.count()
    if (count === 0) {
        console.log("Seeding templates...")
        for (const t of DEFAULT_TEMPLATES) {
            await prisma.template.create({
                data: t
            })
        }
        console.log("Templates seeded.")
    } else {
        console.log("Templates already exist.")
    }
}
