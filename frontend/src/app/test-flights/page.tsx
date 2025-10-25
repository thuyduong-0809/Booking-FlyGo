"use client";

import { useEffect, useState } from 'react';
import { flightsService } from '../../services/flights.service';
import { airportsService, Airport } from '../../services/airports.service';

export default function TestFlightsPage() {
    const [allFlights, setAllFlights] = useState<any>(null);
    const [searchResult, setSearchResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [airports, setAirports] = useState<Airport[]>([]);
    const [error, setError] = useState<string>('');

    // State cho dropdown selection
    const [selectedDepartureAirport, setSelectedDepartureAirport] = useState<string>('');
    const [selectedArrivalAirport, setSelectedArrivalAirport] = useState<string>('');
    const [departureDate, setDepartureDate] = useState<string>('');

    useEffect(() => {
        fetchAirports();
    }, []);

    const fetchAirports = async () => {
        try {
            const response = await airportsService.getAllAirports();
            if (response.success && response.data) {
                setAirports(response.data);
                setError('');
            }
        } catch (error: any) {
            console.error('Error fetching airports:', error);
            setError(`Lỗi kết nối API: ${error.message || 'Không thể kết nối đến backend'}`);
        }
    };

    const fetchAllFlights = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await flightsService.getAllFlights();
            console.log('All flights:', response);
            setAllFlights(response);
        } catch (error: any) {
            console.error('Error:', error);
            setError(`Lỗi: ${error.message || 'Không thể tải dữ liệu chuyến bay'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const response = await flightsService.searchFlights({
                departureAirportCode: selectedDepartureAirport,
                arrivalAirportCode: selectedArrivalAirport,
                departureDate: departureDate
            });
            console.log('Search result:', response);
            setSearchResult(response);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const testSearchWithoutFilters = async () => {
        setLoading(true);
        try {
            // Test search không có filter để xem tất cả chuyến bay
            const response = await flightsService.searchFlights({});
            console.log('Search without filters:', response);
            setSearchResult(response);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">Test Flights API</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                    <p className="text-sm mt-2">Vui lòng đảm bảo backend đang chạy tại http://localhost:3001</p>
                </div>
            )}

            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">All Flights</h2>
                <button
                    onClick={fetchAllFlights}
                    className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Fetch All Flights'}
                </button>
                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-black">
                    {JSON.stringify(allFlights, null, 2)}
                </pre>
            </div>

            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Search Flights</h2>

                {/* Dropdown để chọn sân bay */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Sân bay đi:
                        </label>
                        <select
                            value={selectedDepartureAirport}
                            onChange={(e) => setSelectedDepartureAirport(e.target.value)}
                            className="w-full text-black px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">-- Chọn sân bay đi --</option>
                            {airports.map((airport) => (
                                <option key={airport.airportId} value={airport.airportCode}>
                                    {airport.airportCode} - {airport.city}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Sân bay đến:
                        </label>
                        <select
                            value={selectedArrivalAirport}
                            onChange={(e) => setSelectedArrivalAirport(e.target.value)}
                            className="w-full text-black px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">-- Chọn sân bay đến --</option>
                            {airports.map((airport) => (
                                <option key={airport.airportId} value={airport.airportCode}>
                                    {airport.airportCode} - {airport.city}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Ngày bay:
                        </label>
                        <input
                            type="date"
                            value={departureDate}
                            onChange={(e) => setDepartureDate(e.target.value)}
                            className="w-full text-black px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="flex space-x-4 mb-4">
                    <button
                        onClick={handleSearch}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Tìm kiếm'}
                    </button>
                    <button
                        onClick={testSearchWithoutFilters}
                        className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Tìm tất cả'}
                    </button>
                </div>

                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-black">
                    {JSON.stringify(searchResult, null, 2)}
                </pre>
            </div>
        </div>
    );
}
