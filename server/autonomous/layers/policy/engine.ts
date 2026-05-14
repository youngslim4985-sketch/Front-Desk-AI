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
    name: 'high_stakes_pi_approval',
    conditions: {
      environments: ['production'],
      actions: ['open_legal_matter']
    },
    constraint: (intent) => {
      // Logic: Personal Injury (PI) matters require senior partner approval
      return intent.params.practice !== 'litigation' || intent.params.priority !== 'high';
    },
    reason: 'High-stakes personal injury matters require senior operator verification',
    metadata: { severity: 'high' }
  },
  {
    name: 'conflict_check_mandatory',
    conditions: {
      environments: ['*'],
      actions: ['open_legal_matter']
    },
    constraint: (_intent) => {
      // In a real system, this would check if a conflict_check event was recently cleared
      return true; 
    },
    metadata: { requiredStep: 'conflict_search' }
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
