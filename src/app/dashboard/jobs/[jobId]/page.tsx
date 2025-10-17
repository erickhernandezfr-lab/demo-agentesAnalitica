'use client';

import { useEffect, useState, Component } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { Job } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// --- Interfaces and Constants ---
interface Componente {
    nombre: string;
    crop: string;
}

interface ScraperData {
    url: string;
    componentes: Componente[];
}

const BASE_PROMPT = "Analiza el JSON de componentes y las imágenes adjuntas del sitio https://multiplica.com. Evalúa la coherencia entre el nombre del componente y su captura de pantalla. Genera un reporte SEO/UX de cada página. Tu reporte debe ser conciso.";

// --- Helper Component for Image Fallback ---
class ImageWithFallback extends Component<{ src: string, alt: string }, { error: boolean }> {
    constructor(props: { src: string, alt: string }) {
        super(props);
        this.state = { error: false };
    }

    handleError = () => {
        this.setState({ error: true });
    };

    render() {
        if (this.state.error) {
            return (
                <div className="bg-gray-200 dark:bg-gray-800 h-32 w-full flex items-center justify-center rounded-md">
                    <p className="text-xs text-gray-500 text-center">Simulación de imagen<br/>(No encontrada)</p>
                </div>
            );
        }
        return <img src={this.props.src} alt={this.props.alt} onError={this.handleError} className="w-full h-32 object-contain rounded-md" />;
    }
}

// --- Main Page Component ---
export default function JobDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.jobId as string;

    // States for data and UI flow
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mockData, setMockData] = useState<{ scraperData: ScraperData[] | null; aiReport: string | null }>({ scraperData: null, aiReport: null });
    const [showInitialAnalysis, setShowInitialAnalysis] = useState(false);
    
    // States for advanced mock flow
    const [prompt, setPrompt] = useState(BASE_PROMPT);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showFinalReport, setShowFinalReport] = useState(false);
    const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);

    useEffect(() => {
        if (jobId === 'mock-job-demo') {
            const scraperDataString = localStorage.getItem('mockScraperData');
            const aiReportString = localStorage.getItem('mockAiReport');
            if (scraperDataString && aiReportString) {
                setMockData({ scraperData: JSON.parse(scraperDataString), aiReport: aiReportString });
            }
            setLoading(false);
            return;
        }

        // Real data fetching logic remains unchanged
    }, [jobId]);

    const handleRunAnalysis = async () => {
        setIsAnalyzing(true);
        await new Promise(resolve => setTimeout(resolve, 10000));
        setIsAnalyzing(false);
        setShowFinalReport(true);
    };

    const handleGenerateTaggingGuide = async () => {
        setIsGeneratingGuide(true);
        await new Promise(resolve => setTimeout(resolve, 10000));
        router.push(`/dashboard/jobs/mock-job-demo/tagging-guide`);
        setIsGeneratingGuide(false);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="mr-2 h-8 w-8 animate-spin" /><span>Loading...</span></div>;
    }

    if (jobId !== 'mock-job-demo') {
        // Real data rendering logic here...
        return <div>Real job data view is not implemented in this mock flow.</div>
    }

    // --- RENDER MOCK DEMO ---
    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbPage>Job: {jobId}</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-2xl font-semibold">Insight Forge Analysis (MOCK)</h1>

            <Card>
                <CardHeader><CardTitle>Scrapping Complete</CardTitle></CardHeader>
                <CardContent>
                    {!showInitialAnalysis && <Button onClick={() => setShowInitialAnalysis(true)}>Analizar con IA</Button>}
                </CardContent>
            </Card>

            {showInitialAnalysis && (
                <div className="space-y-6 animate-in fade-in-50">
                    <Card>
                        <CardHeader><CardTitle>Raw Scraper Data</CardTitle></CardHeader>
                        <CardContent><pre className="p-4 bg-gray-100 dark:bg-gray-900 rounded-md overflow-x-auto text-xs"><code>{JSON.stringify(mockData.scraperData, null, 2)}</code></pre></CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Capturas de Componentes del Sitio</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {mockData.scraperData && mockData.scraperData[0].componentes.map((componente) => {
                                const imageName = componente.crop.split('/').pop() ?? '';
                                return (
                                    <Card key={componente.nombre}>
                                        <CardHeader className="p-2"><CardTitle className="text-sm truncate">{componente.nombre}</CardTitle></CardHeader>
                                        <CardContent className="p-2"><ImageWithFallback src={`/images/multiplica/${imageName}`} alt={`Capture of ${componente.nombre}`} /></CardContent>
                                    </Card>
                                );
                            })}
                        </CardContent>
                    </Card>
                    
                    {!showFinalReport && (
                         <Card>
                            <CardHeader><CardTitle>Editor de Prompt IA</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5} className="w-full text-sm"/>
                                <Button onClick={handleRunAnalysis} disabled={isAnalyzing} className="w-full">
                                    {isAnalyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analizando...</> : 'Realizar Análisis'}
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                    
                    {showFinalReport && (
                        <div className="space-y-6 animate-in fade-in-50">
                            {/* 1. Design Fix: Added margin to this card */}
                            <Card className="border-green-500 my-6">
                                <CardHeader><CardTitle>Final AI Analysis Report (MOCK)</CardTitle></CardHeader>
                                <CardContent><p className="whitespace-pre-wrap text-sm">{mockData.aiReport}</p></CardContent>
                            </Card>

                            {/* 2. Export Card with new button */}
                            <Card>
                                <CardHeader><CardTitle>Export</CardTitle></CardHeader>
                                <CardContent className="flex flex-col space-y-4">
                                    <Button onClick={handleGenerateTaggingGuide} disabled={isGeneratingGuide}>
                                        {isGeneratingGuide ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando...</> : 'Generar Guía de Taggeo'}
                                    </Button>
                                    <Button disabled>Crear PDF de Análisis</Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
