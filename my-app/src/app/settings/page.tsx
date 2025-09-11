"use client";

import { VStack, Heading, Text, Switch, FormControl, FormLabel } from "@chakra-ui/react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <VStack spacing={6} align="start">
        <Heading>Settings</Heading>
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="auto-download" mb="0">
            Auto-download after conversion
          </FormLabel>
          <Switch id="auto-download" />
        </FormControl>
        <Text color="gray.500">More settings coming soon...</Text>
      </VStack>
    </DashboardLayout>
  );
}
