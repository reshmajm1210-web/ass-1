import { workflowSteps } from './workflow-steps.ts'

/** Four-step job workflow; the shipping bill is always the current step. */
export function WorkflowStrip() {
  return (
    <div className="workflow">
      {workflowSteps.map((step, index) => {
        const current = index === 0
        return (
          <div key={step.id} className={current ? 'workflow__step workflow__step--current' : 'workflow__step'}>
            <div className="workflow__title">
              <span className="workflow__index">{index + 1}</span>
              {step.title}
            </div>
            <p className="workflow__description">{step.description}</p>
          </div>
        )
      })}
    </div>
  )
}
