<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HelpCenterController extends Controller
{
    /**
     * Display help center
     */
    public function index(): Response
    {
        $faqs = $this->getFaqs();
        $categories = $this->getCategories();

        return Inertia::render('help-center/index', [
            'faqs' => $faqs,
            'categories' => $categories,
        ]);
    }

    /**
     * Show specific help article
     */
    public function show(string $slug): Response
    {
        $article = $this->getArticle($slug);

        if (!$article) {
            abort(404);
        }

        return Inertia::render('help-center/article', [
            'article' => $article,
            'relatedArticles' => $this->getRelatedArticles($article['category'])
        ]);
    }

    /**
     * Search help articles
     */
    public function search(Request $request): Response
    {
        $query = $request->get('q');
        $results = $this->searchArticles($query);

        return Inertia::render('help-center/search', [
            'query' => $query,
            'results' => $results,
        ]);
    }

    /**
     * Get FAQ data
     */
    private function getFaqs()
    {
        return [
            [
                'id' => 1,
                'question' => 'How do I create a new project?',
                'answer' => 'Go to the projects page and click "Create Project". Fill in the required information and assign team members.',
                'category' => 'projects'
            ],
            [
                'id' => 2,
                'question' => 'How do I manage team members?',
                'answer' => 'Admin users can manage team members from the Team Management section in the sidebar.',
                'category' => 'Teams'
            ],
            [
                'id' => 3,
                'question' => 'How do I change my password?',
                'answer' => 'Go to Settings > Security and use the "Change Password" section.',
                'category' => 'Security'
            ],
        ];
    }

    /**
     * Get help categories
     */
    private function getCategories()
    {
        return [
            ['name' => 'Getting Started', 'count' => 5],
            ['name' => 'projects', 'count' => 8],
            ['name' => 'Teams', 'count' => 6],
            ['name' => 'Security', 'count' => 4],
            ['name' => 'Troubleshooting', 'count' => 7],
        ];
    }

    /**
     * Get specific article
     */
    private function getArticle(string $slug)
    {
        $articles = [
            'creating-projects' => [
                'title' => 'Creating and Managing projects',
                'content' => 'This guide will help you understand how to create and manage projects effectively...',
                'category' => 'projects',
                'updated_at' => now()->subDays(2),
            ],
            'team-management' => [
                'title' => 'Team Management Guide',
                'content' => 'Learn how to manage teams, add members, and assign roles...',
                'category' => 'Teams',
                'updated_at' => now()->subDays(5),
            ],
        ];

        return $articles[$slug] ?? null;
    }

    /**
     * Search articles
     */
    private function searchArticles(string $query)
    {
        // Mock search results
        return [
            [
                'title' => 'Creating projects',
                'excerpt' => 'Learn how to create new projects and set them up properly...',
                'url' => '/dashboard/help-center/creating-projects'
            ],
            [
                'title' => 'Managing Team Members',
                'excerpt' => 'Guide on how to add, remove, and manage team members...',
                'url' => '/dashboard/help-center/team-management'
            ],
        ];
    }

    /**
     * Get related articles
     */
    private function getRelatedArticles(string $category)
    {
        return [
            [
                'title' => 'Project Best Practices',
                'url' => '/dashboard/help-center/project-best-practices'
            ],
            [
                'title' => 'Task Management Tips',
                'url' => '/dashboard/help-center/task-management'
            ],
        ];
    }
}
