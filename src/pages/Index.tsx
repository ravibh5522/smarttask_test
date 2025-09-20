import { ArrowRight, Brain, Calendar, CheckCircle, Users, Zap, Star, Shield, Smartphone, Check, User, Building, Building2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { SmartTaskLogo } from "@/components/ui/SmartTaskIcon";
import { Link } from "react-router-dom";
import { useState } from "react";

const Index = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Task Management",
      description: "Smart task decomposition, priority suggestions, and deadline optimization powered by advanced AI."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Real-time collaboration, role-based permissions, and seamless team communication."
    },
    {
      icon: Calendar,
      title: "Advanced Planning",
      description: "Timeline views, dependency tracking, and intelligent scheduling across projects."
    },
    {
      icon: Zap,
      title: "Automation Rules",
      description: "No-code workflow automation to streamline repetitive tasks and processes."
    },
    {
      icon: CheckCircle,
      title: "Multi-Stage Approvals",
      description: "Configurable approval workflows with audit trails and compliance tracking."
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Role-based access control, audit logs, and compliance-ready data governance."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Project Manager",
      company: "TechCorp",
      content: "This platform transformed how we manage projects. The AI suggestions are incredibly accurate."
    },
    {
      name: "Mike Rodriguez",
      role: "Team Lead",
      company: "StartupXYZ",
      content: "Finally, a task management tool that actually understands our workflow patterns."
    },
    {
      name: "Emily Johnson",
      role: "Operations Director",
      company: "Enterprise Inc",
      content: "The multi-organization support and compliance features are exactly what we needed."
    }
  ];

  const pricingPlans = [
    {
      name: "Individual",
      description: "Perfect for personal task management",
      price: "Free",
      period: "forever",
      icon: User,
      features: [
        "Unlimited personal tasks",
        "Basic AI assistance",
        "Calendar integration",
        "Mobile app access",
        "1 GB file storage",
        "Email support"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Teams",
      description: "Ideal for small to medium teams",
      price: "$2.50",
      originalPrice: "$5",
      period: "per project + $0.50/user/month",
      originalPeriod: "per project + $1/user/month",
      icon: Users,
      discount: "50% OFF",
      features: [
        "Everything in Individual",
        "Unlimited team members",
        "Advanced AI automation",
        "Team collaboration tools",
        "Project templates",
        "Time tracking",
        "10 GB file storage per project",
        "Priority support"
      ],
      cta: "Start Team Trial",
      popular: true
    },
    {
      name: "Enterprise",
      description: "For large organizations",
      price: "$5",
      originalPrice: "$10",
      period: "base + $2/project + $0.50/user/month",
      originalPeriod: "base + $4/project + $1/user/month",
      icon: Building2,
      discount: "50% OFF",
      features: [
        "Everything in Teams",
        "Multi-organization support",
        "Advanced security & compliance",
        "Custom integrations",
        "Dedicated account manager",
        "Custom AI training",
        "Unlimited file storage",
        "24/7 phone support",
        "SLA guarantee"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const faqs = [
    {
      question: "How does the pricing work for teams?",
      answer: "With our current 50% off promotion, teams pay just $2.50 per project plus $0.50 per user per month. For example, a team of 5 users working on 2 projects would pay $2.50×2 + $0.50×5 = $7.50/month (normally $15/month)."
    },
    {
      question: "What's included in the Enterprise plan?",
      answer: "With 50% off, Enterprise includes a $5 base fee (normally $10) plus $2 per project (normally $4) and $0.50 per user per month (normally $1). You get multi-organization support, advanced security, custom integrations, dedicated support, and unlimited storage."
    },
    {
      question: "How long does the 50% discount last?",
      answer: "This is a limited-time promotional offer for new customers. The discount applies to your first 12 months of service. After that, standard pricing applies, but you can cancel anytime."
    },
    {
      question: "Can I switch plans anytime?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the billing accordingly."
    },
    {
      question: "Is there really a free plan?",
      answer: "Absolutely! The Individual plan is completely free forever with no hidden costs. Perfect for personal task management with basic AI features."
    },
    {
      question: "What happens to my data if I cancel?",
      answer: "You can export all your data at any time. After cancellation, you have 30 days to download your data before it's permanently deleted."
    },
    {
      question: "Do you offer discounts for non-profits or education?",
      answer: "Yes! We offer additional discounts for verified non-profit organizations and educational institutions on top of our current promotion. Contact our sales team for more details."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <SmartTaskLogo size="sm" variant="auto" />
          
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-smooth">Features</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-smooth">Pricing</a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-smooth">Reviews</a>
            <Link to="#about" className="text-muted-foreground hover:text-foreground transition-smooth">About</Link>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="bg-gradient-primary hover:shadow-medium transition-smooth">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            <Zap className="w-3 h-3 mr-1" />
            AI-Powered Project Management
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            Manage Projects with
            <br />Intelligent Automation
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform your team's productivity with AI-driven task management, smart scheduling, 
            and seamless collaboration tools designed for modern organizations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-primary hover:shadow-medium transition-smooth">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              Watch Demo
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-4 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-warning fill-warning" />
              <span>Free 14-day trial</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-success" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage projects efficiently, from AI assistance to enterprise security.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 hover:shadow-medium transition-smooth">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          {/* Promotional Banner */}
          <div className="text-center mb-8">
            <Badge className="bg-red-500 text-white px-6 py-2 text-lg animate-pulse mb-4">
              🎉 LIMITED TIME: 50% OFF Teams & Enterprise Plans!
            </Badge>
          </div>
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your needs. Start free and scale as you grow.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative border-border/50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                  plan.popular 
                    ? 'border-primary shadow-medium scale-105 bg-gradient-to-b from-primary/5 to-transparent' 
                    : 'hover:scale-105'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-primary text-white px-4 py-1 shadow-lg">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                {plan.discount && (
                  <div className="absolute -top-4 right-4">
                    <Badge className="bg-red-500 text-white px-3 py-1 shadow-lg animate-pulse">
                      {plan.discount}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                    plan.popular 
                      ? 'bg-gradient-primary shadow-glow' 
                      : 'bg-gradient-primary'
                  }`}>
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-base mb-4">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="space-y-1">
                    {plan.originalPrice ? (
                      <div className="flex flex-col items-center">
                        <div className="flex items-baseline justify-center gap-2 mb-1">
                          <span className="text-lg text-muted-foreground line-through">
                            {plan.originalPrice}
                          </span>
                          {plan.originalPrice !== "Free" && (
                            <span className="text-xs text-muted-foreground line-through">/month</span>
                          )}
                        </div>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className={`text-4xl font-bold ${
                            plan.popular ? 'text-primary-readable' : 'text-green-600'
                          }`}>
                            {plan.price}
                          </span>
                          {plan.price !== "Free" && (
                            <span className="text-sm text-muted-foreground">/month</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-baseline justify-center gap-1">
                        <span className={`text-4xl font-bold ${
                          plan.popular ? 'text-primary-readable' : ''
                        }`}>
                          {plan.price}
                        </span>
                        {plan.price !== "Free" && (
                          <span className="text-sm text-muted-foreground">/month</span>
                        )}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {plan.period}
                    </p>
                    {plan.originalPeriod && (
                      <p className="text-xs text-muted-foreground line-through">
                        Was: {plan.originalPeriod}
                      </p>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="pt-4">
                    <Link to="/auth" className="block">
                      <Button 
                        className={`w-full transition-smooth ${
                          plan.popular 
                            ? 'bg-gradient-primary hover:shadow-glow text-white' 
                            : plan.name === 'Enterprise'
                            ? 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                            : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                        }`}
                        size="lg"
                      >
                        {plan.cta}
                        {plan.name !== 'Enterprise' && (
                          <ArrowRight className="w-4 h-4 ml-2" />
                        )}
                      </Button>
                    </Link>
                    
                    {plan.name === 'Teams' && (
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        14-day free trial included
                      </p>
                    )}
                    
                    {plan.name === 'Enterprise' && (
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Custom pricing available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              🔥 <strong>50% OFF promotion</strong> valid for first 12 months • 14-day free trial • No credit card required • Cancel anytime
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Enterprise-grade security
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                99.9% uptime SLA
              </span>
              <span className="flex items-center gap-1">
                <Brain className="w-4 h-4" />
                AI-powered insights
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Got questions? We've got answers.
            </p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Collapsible
                key={index}
                open={openFaq === index}
                onOpenChange={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <Card className="border-border/50 hover:shadow-medium transition-shadow">
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="hover:bg-muted/30 transition-smooth text-left">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold pr-4">
                          {faq.question}
                        </CardTitle>
                        <HelpCircle className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${
                          openFaq === index ? 'rotate-180' : ''
                        }`} />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-6">
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Still have questions?
            </p>
            <Button variant="outline" size="lg">
              Contact Support
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Teams Worldwide</h2>
            <p className="text-xl text-muted-foreground">
              See what our customers are saying about TaskFlow AI.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border/50">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role} • {testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of teams already using TaskFlow AI to deliver projects faster and more efficiently.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                Start Your Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border/50 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gradient-primary rounded flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold">TaskFlow AI</span>
              </div>
              <p className="text-muted-foreground text-sm">
                AI-powered project management for modern teams.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="#" className="hover:text-foreground transition-smooth">Features</Link></li>
                <li><Link to="#" className="hover:text-foreground transition-smooth">Pricing</Link></li>
                <li><Link to="#" className="hover:text-foreground transition-smooth">Enterprise</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="#" className="hover:text-foreground transition-smooth">Documentation</Link></li>
                <li><Link to="#" className="hover:text-foreground transition-smooth">Help Center</Link></li>
                <li><Link to="#" className="hover:text-foreground transition-smooth">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="#" className="hover:text-foreground transition-smooth">About</Link></li>
                <li><Link to="#" className="hover:text-foreground transition-smooth">Careers</Link></li>
                <li><Link to="#" className="hover:text-foreground transition-smooth">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 TaskFlow AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;