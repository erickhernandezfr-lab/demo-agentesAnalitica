'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function TaggingGuidePage() {

    const handleDownload = () => {
        // In a real scenario, this would trigger a file download.
        // For this mock, we just show an alert.
        alert('Simulación de descarga del PDF de la guía de taggeo.');
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
            <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <h1 className="text-2xl md:text-3xl font-bold">Guía de Taggeo Generada (MOCK)</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Visualización de Documento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                        La guía de taggeo basada en el análisis de IA está lista. 
                        Esta vista simula la visualización de un documento PDF interactivo.
                    </p>
                    <div className="w-full h-96 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center border">
                        <p className="text-lg font-semibold text-gray-500">[ Simulación de Visualizador de PDF ]</p>
                    </div>
                    <div className="text-center pt-4">
                        <Button onClick={handleDownload}>
                            Descargar PDF
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
