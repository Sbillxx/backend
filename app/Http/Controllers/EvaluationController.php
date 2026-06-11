<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EvaluationController extends Controller
{
    /**
     * Display a listing of evaluations.
     */
    public function index(): Response
    {
        $evaluations = Evaluation::with(['anggota.divisi'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($eval) {
                return [
                    'id' => $eval->id,
                    'anggota' => $eval->anggota ? [
                        'id' => $eval->anggota->id,
                        'nama' => $eval->anggota->nama,
                        'jabatan' => $eval->anggota->jabatan,
                        'foto' => $eval->anggota->foto ? (str_starts_with($eval->anggota->foto, 'http') ? $eval->anggota->foto : asset('storage/' . $eval->anggota->foto)) : 'https://ui-avatars.com/api/?name='.urlencode($eval->anggota->nama).'&background=random&format=png',
                        'divisi' => $eval->anggota->divisi ? $eval->anggota->divisi->nama : 'N/A',
                    ] : [
                        'id' => 0,
                        'nama' => 'Staf Terhapus',
                        'jabatan' => 'Tidak Diketahui',
                        'foto' => 'https://ui-avatars.com/api/?name=Staf+Terhapus&background=random&format=png',
                        'divisi' => 'N/A',
                    ],
                    'rating' => $eval->rating,
                    'note' => $eval->note,
                    'date' => $eval->date,
                    'created_at' => $eval->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('evaluations/index', [
            'evaluations' => $evaluations
        ]);
    }
}
