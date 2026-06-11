    public function index()
    {
        $projects = Project::with(['user', 'assignedUsers', 'tasks.assignedUser'])
            ->withCount(['tasks', 'tasks as completed_tasks_count' => function ($query) {
                $query->where('status', 'completed');
            }])
            ->latest()
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'description' => $project->description,
                    'status' => $project->status,
                    'priority' => $project->priority,
                    'start_date' => $project->start_date?->format('Y-m-d'),
                    'due_date' => $project->due_date?->format('Y-m-d'),
                    'user' => $project->user,
                    'assigned_users' => $project->assignedUsers,
                    'tasks_count' => $project->tasks_count,
                    'completed_tasks_count' => $project->completed_tasks_count,
                    'progress_percentage' => $project->progress_percentage,
                    'created_at' => $project->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'users' => User::select('id', 'name', 'email')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:planning,in_progress,completed,on_hold',
            'priority' => 'required|in:low,medium,high,urgent',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'user_id' => 'required|exists:users,id',
            'assigned_users' => 'array',
            'assigned_users.*' => 'exists:users,id',
        ]);

        $assignedUsers = $validated['assigned_users'] ?? [];
        unset($validated['assigned_users']);

        $project = Project::create($validated);

        // Sync assigned users
        $project->assignedUsers()->sync($assignedUsers);

        return redirect()->back()->with('success', 'Project created successfully!');
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:planning,in_progress,completed,on_hold',
            'priority' => 'required|in:low,medium,high,urgent',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'user_id' => 'required|exists:users,id',
            'assigned_users' => 'array',
            'assigned_users.*' => 'exists:users,id',
        ]);

        $assignedUsers = $validated['assigned_users'] ?? [];
        unset($validated['assigned_users']);

        $project->update($validated);

        // Sync assigned users
        $project->assignedUsers()->sync($assignedUsers);

        return redirect()->back()->with('success', 'Project updated successfully!');
    }

    public function show(Project $project)
    {
        $project->load(['user', 'assignedUsers', 'tasks.assignedUser']);

        return Inertia::render('Projects/Show', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'description' => $project->description,
                'status' => $project->status,
                'priority' => $project->priority,
                'start_date' => $project->start_date?->format('Y-m-d'),
                'due_date' => $project->due_date?->format('Y-m-d'),
                'user' => $project->user,
                'assigned_users' => $project->assignedUsers,
                'tasks' => $project->tasks->map(function ($task) {
                    return [
                        'id' => $task->id,
                        'title' => $task->title,
                        'description' => $task->description,
                        'status' => $task->status,
                        'priority' => $task->priority,
                        'due_date' => $task->due_date?->format('Y-m-d'),
                        'assigned_user' => $task->assignedUser,
                        'created_at' => $task->created_at->format('Y-m-d H:i:s'),
                    ];
                }),
                'progress_percentage' => $project->progress_percentage,
                'completed_tasks_count' => $project->completed_tasks_count,
                'total_tasks_count' => $project->total_tasks_count,
                'created_at' => $project->created_at->format('Y-m-d H:i:s'),
            ],
            'users' => User::select('id', 'name', 'email')->get(),
        ]);
    }
