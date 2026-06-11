import { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import { AuthenticatedLayout } from '@/layouts/authenticated-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { IconSearch, IconHelp, IconBook, IconUsers, IconShield } from '@tabler/icons-react'

interface FAQ {
  id: number
  question: string
  answer: string
  category: string
}

interface Category {
  name: string
  count: number
}

interface HelpCenterIndexProps {
  faqs: FAQ[]
  categories: Category[]
}

export default function HelpCenterIndex({ faqs, categories }: HelpCenterIndexProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.get(route('dashboard.help-center.search'), { q: searchQuery })
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'projects':
        return <IconBook className="h-5 w-5" />
      case 'teams':
        return <IconUsers className="h-5 w-5" />
      case 'security':
        return <IconShield className="h-5 w-5" />
      default:
        return <IconHelp className="h-5 w-5" />
    }
  }

  return (
    <AuthenticatedLayout title="Help Center">
      <Head title="Help Center" />

      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Help Center</h1>
          <p className="text-xl text-muted-foreground mt-2">
            Find answers to common questions and learn how to use the platform
          </p>
        </div>

        {/* Search */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search for help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Browse help articles by category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.name}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(category.name)}
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <Badge variant="secondary">{category.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* FAQs */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  {searchQuery ? `Search results for "${searchQuery}"` : 'Common questions and answers'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredFaqs.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFaqs.map((faq) => (
                      <AccordionItem key={faq.id} value={faq.id.toString()}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-start gap-2">
                            <span>{faq.question}</span>
                            <Badge variant="outline" className="ml-auto text-xs">
                              {faq.category}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="text-muted-foreground">
                            {faq.answer}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-8">
                    <IconHelp className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No results found</h3>
                    <p className="text-muted-foreground">
                      Try searching with different keywords or browse our categories.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Popular help articles and guides</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/dashboard/help-center/creating-projects"
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <h4 className="font-medium">Creating Projects</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Learn how to create and manage projects effectively
                </p>
              </Link>
              <Link
                href="/dashboard/help-center/team-management"
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <h4 className="font-medium">Team Management</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Guide on managing teams and members
                </p>
              </Link>
              <Link
                href="/dashboard/help-center/security-settings"
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <h4 className="font-medium">Security Settings</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Keep your account secure with proper settings
                </p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}
