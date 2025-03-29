"use client";

import { useState } from 'react';
import UpdateMealAttendance from '@/components/UpdateMealAttendance';
import MealUpdatePopup from '@/components/UpdateUserMeal';
import { Card, CardContent} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserRound } from "lucide-react";

function Page() {
  const [activeTab, setActiveTab] = useState("updateAll");
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-850 to-gray-800 text-gray-100 py-12 pt-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <Card className="bg-gray-900 overflow-hidden">
          
          <CardContent className="pt-6">
            <Tabs 
              defaultValue="updateAll" 
              value={activeTab} 
              onValueChange={setActiveTab} 
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 bg-gray-800 rounded-lg mb-6 p-1">
                <TabsTrigger 
                  value="updateAll" 
                  className="rounded-md transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center justify-center gap-2 py-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Update All Users</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="updateSingle" 
                  className="rounded-md transition-all duration-200 data-[state=active]:bg-green-600 data-[state=active]:text-white flex items-center justify-center gap-2 py-2"
                >
                  <UserRound className="h-4 w-4" />
                  <span>Update Single User</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="updateAll" className="mt-0 animate-in fade-in-50 duration-300">
                <div className="p-6">
                  <UpdateMealAttendance />
                </div>
              </TabsContent>
              
              <TabsContent value="updateSingle" className="mt-0 animate-in fade-in-50 duration-300">
                <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 shadow-inner">
                  <h3 className="text-lg font-medium text-white mb-4">Individual User Update</h3>
                  <MealUpdatePopup />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Page;