import { Intent, PolicyResult } from '../../types';

export interface Policy {
  name: string;
  conditions: {
    environments: string[];
    actions: string[];
  };
  constraint: (intent: Intent) => boolean;
  reason?: string;
  metadata: Record<string, any>;
}

export const policies: Policy[] = [
  {
    name: 'production_no_destructive',
    conditions: {
      environments: ['production'],
      actions: ['deploy_service', 'delete_service']
    },
    constraint: (intent) => {
      // Logic: Production requires specific tags, or the 'force' flag
      return intent.params.tag !== 'latest' || intent.params.force === true;
    },
    reason: 'Production requires versioned tags, not "latest"',
    metadata: { severity: 'high' }
  }
];

export class PolicyEngine {
  evaluate(intent: Intent, context: { approved: boolean }): PolicyResult {
    const applicablePolicies = policies.filter(p => 
      p.conditions.environments.includes(intent.environment) ||
      p.conditions.actions.includes(intent.action)
    );
    
    for (const policy of applicablePolicies) {
      if (!policy.constraint(intent)) {
        return {
          allowed: false,
          requiresApproval: false,
          reason: policy.reason || 'Policy violation',
          constraints: policy.metadata
        };
      }
    }
    
    const requiresApproval = intent.environment === 'production' ||
                            intent.action === 'delete_service';
    
    return {
      allowed: true,
      requiresApproval: requiresApproval && !context.approved,
      reason: requiresApproval ? 'Environment security policy requires operator approval' : 'Auto-approved'
    };
  }
}
