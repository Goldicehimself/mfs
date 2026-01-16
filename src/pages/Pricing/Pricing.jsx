import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    { name: 'Starter', price: '$0', features: ['Up to 5 assets', 'Basic reporting'] },
    { name: 'Team', price: '$49', features: ['Unlimited assets', 'Preventive maintenance', 'Priority support'] },
    { name: 'Enterprise', price: 'Contact', features: ['SLA', 'Onboarding', 'Custom integrations'] },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <h1 className="text-4xl font-bold mb-4">Pricing</h1>
        <p className="text-gray-600 mb-8">Simple, transparent pricing to get your team started.</p>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.name} className="border rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold">{p.name}</h3>
              <div className="text-3xl font-bold mt-4">{p.price}</div>
              <ul className="mt-4 space-y-2 text-gray-600">
                {p.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              <Button size="lg" className="mt-6" onClick={() => navigate('/register')}>Start {p.name}</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;