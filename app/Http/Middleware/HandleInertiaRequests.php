<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? array_merge($request->user()->toArray(), [
                    'avatar' => $request->user()->profile_image 
                        ? (str_starts_with($request->user()->profile_image, 'http') ? $request->user()->profile_image : asset('storage/' . $request->user()->profile_image))
                        : 'https://ui-avatars.com/api/?name='.urlencode($request->user()->name).'&background=random'
                ]) : null,
            ],
        ];
    }
}
