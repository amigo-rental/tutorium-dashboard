"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Spinner } from "@heroui/spinner";

import { apiClient } from "@/lib/utils/api";

export default function TestProductSystemPage() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [individualLessons, setIndividualLessons] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const testProductsAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getProducts();
      console.log("Products API response:", response);
      
      if (response.error) {
        setError(response.error);
        return;
      }
      
      setProducts((response.data as any[]) || []);
    } catch (err) {
      console.error("Error testing products API:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const testIndividualLessonsAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getIndividualLessons();
      console.log("Individual Lessons API response:", response);
      
      if (response.error) {
        setError(response.error);
        return;
      }
      
      setIndividualLessons((response.data as any[]) || []);
    } catch (err) {
      console.error("Error testing individual lessons API:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-black mb-8">
          🧪 Test Product System
        </h1>
        
        <div className="space-y-6">
          {/* Test Products API */}
          <Card className="border border-slate-200">
            <CardHeader>
              <h2 className="text-xl font-semibold">Test Products API</h2>
            </CardHeader>
            <CardBody>
              <Button
                color="primary"
                onClick={testProductsAPI}
                disabled={loading}
                className="mb-4"
              >
                {loading ? <Spinner size="sm" /> : "Test Products API"}
              </Button>
              
              {products.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Products Found:</h3>
                  {products.map((product) => (
                    <div key={product.id} className="p-3 bg-slate-50 rounded-lg">
                      <p><strong>{product.name}</strong> ({product.type})</p>
                      <p className="text-sm text-slate-600">
                        Course: {product.course?.name} ({product.course?.level})
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Test Individual Lessons API */}
          <Card className="border border-slate-200">
            <CardHeader>
              <h2 className="text-xl font-semibold">Test Individual Lessons API</h2>
            </CardHeader>
            <CardBody>
              <Button
                color="secondary"
                onClick={testIndividualLessonsAPI}
                disabled={loading}
                className="mb-4"
              >
                {loading ? <Spinner size="sm" /> : "Test Individual Lessons API"}
              </Button>
              
              {individualLessons.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Individual Lessons Found:</h3>
                  {individualLessons.map((lesson) => (
                    <div key={lesson.id} className="p-3 bg-slate-50 rounded-lg">
                      <p><strong>{lesson.title}</strong></p>
                      <p className="text-sm text-slate-600">
                        Product: {lesson.product?.name} | 
                        Course: {lesson.product?.course?.name} ({lesson.product?.course?.level})
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="border border-red-200 bg-red-50">
              <CardBody>
                <h3 className="text-red-800 font-medium">Error:</h3>
                <p className="text-red-700">{error}</p>
              </CardBody>
            </Card>
          )}

          {/* System Status */}
          <Card className="border border-green-200 bg-green-50">
            <CardBody>
              <h3 className="text-green-800 font-medium">✅ System Status</h3>
              <p className="text-green-700">
                The new product-based learning system has been implemented with:
              </p>
              <ul className="list-disc list-inside text-green-700 mt-2 space-y-1">
                <li>Product model for different learning types</li>
                <li>Individual lessons with topic tracking</li>
                <li>Unified progress tracking across products</li>
                <li>API endpoints for products and individual lessons</li>
                <li>Admin interface for product management</li>
                <li>Student dashboard integration</li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
