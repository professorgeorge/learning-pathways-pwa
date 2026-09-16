/**
 * Global Application Footer Component
 * Includes concept prototype attribution and legal disclaimer in fine print.
 * Adheres strictly to the rule: No em dashes in user-facing text.
 */

export function renderFooter() {
  return `
    <footer class="app-footer" style="margin-top:3rem; padding:2rem 1rem; border-top:1px solid rgba(255, 255, 255, 0.08); background:rgba(9, 13, 22, 0.9);">
      <div style="max-width:900px; margin:0 auto; text-align:center;">
        <div style="font-size:0.95rem; font-weight:600; color:#e2e8f0; margin-bottom:0.6rem;">
          Pathways: Individually Customized Learning Pathways Framework
        </div>
        
        <p style="font-size:0.875rem; color:#a5b4fc; margin-bottom:1rem; line-height:1.5;">
          Concept prototype conceived and developed by 
          <a href="https://www.linkedin.com/in/beingbabu/" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; font-weight:600; text-decoration:underline;">
            Professor Babu George
          </a>.
        </p>

        <div style="font-size:0.75rem; color:var(--text-dim); line-height:1.6; max-width:760px; margin:0 auto; padding-top:0.75rem; border-top:1px solid rgba(255, 255, 255, 0.05);">
          <strong>Legal Disclaimer:</strong> This application is an experimental research and educational concept prototype provided on an "as-is" and "as-available" basis without representations or warranties of any kind, whether express, implied, statutory, or otherwise. The author, creator, contributors, and affiliated organizations shall in no event be liable for any direct, indirect, incidental, consequential, punitive, special, or exemplary damages, or for any losses (including without limitation loss of data, loss of profits, system interruption, or academic outcomes) arising out of or related to the deployment, use, performance, or inability to use this software, its algorithms, or its associated materials.
        </div>
      </div>
    </footer>
  `;
}
