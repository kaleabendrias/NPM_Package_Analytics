import React, { useState } from "react";
import PackageAnalytics from "./PackageAnalytics";

const PackageForm: React.FC = () => {
  const [packageName, setPackageName] = useState("");
  const [packageVersion, setPackageVersion] = useState("");
  const [submittedPackage, setSubmittedPackage] = useState<{ name: string; version: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Basic validation
    if (!packageName || !packageVersion) {
      setError("Both package name and version are required");
      return;
    }

    // Send the package info to PackageAnalytics
    setSubmittedPackage({
      name: packageName,
      version: packageVersion
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <form 
          onSubmit={handleSubmit}
          className="flex flex-col items-start p-6 bg-white shadow-md rounded-lg"
        >
          <label htmlFor="packageName" className="text-sm font-medium text-gray-700 mb-1">
            Package Name:
          </label>
          <input
            type="text"
            id="packageName"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            className="mb-4 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            placeholder="Enter package name (e.g., express)"
          />

          <label htmlFor="packageVersion" className="text-sm font-medium text-gray-700 mb-1">
            Package Version:
          </label>
          <input
            type="text"
            id="packageVersion"
            value={packageVersion}
            onChange={(e) => setPackageVersion(e.target.value)}
            className="mb-4 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            placeholder="Enter package version (e.g., 4.18.2)"
          />

          {error && (
            <div className="w-full mb-4 p-3 bg-red-50 text-red-600 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full px-4 py-2 mt-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            Analyze Package
          </button>
        </form>

        <PackageAnalytics packageInfo={submittedPackage} />
      </div>
    </div>
  );
};

export default PackageForm;