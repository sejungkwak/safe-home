import React, { useEffect, useState } from "react";
import { Alert, Linking, ScrollView, View } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";

import formatDate from "@/lib/format-date";
import { supabase } from "@/lib/supabase";

type DriverApplication = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  licenceUrl: string | null;
};

/**
 * Admin screen displaying a list of pending driver applications
 * for review. Each card includes name, email, submission date,
 * a link to the driving licence image, and two buttons, reject and verify.
 */
export default function DriverApplicationList() {
  const [applications, setApplications] = useState<DriverApplication[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    // retrieve pending or resubmitted applications
    async function getNewApplications() {
      const { data, error } = await supabase
        .from("driver_verification")
        .select("id, created_at, driver_id(name, email, driving_licence)")
        .in("status", ["pending", "resubmitted"]);

      if (error) throw error;
      if (!data || data.length === 0) return;

      const applicationArray = await Promise.all(
        data.map(async (row) => {
          const profile = row.driver_id as any;
          let licenceUrl: string | null = null;

          if (profile.driving_licence) {
            const { data: signedData } = await supabase.storage
              .from("licences")
              .createSignedUrl(profile.driving_licence, 3600);
            licenceUrl = signedData?.signedUrl ?? null;
          }

          const { formattedDate, formattedTime } = formatDate(
            new Date(row.created_at),
          );
          return {
            id: row.id,
            name: profile.name,
            email: profile.email,
            created_at: `${formattedDate} ${formattedTime}`,
            licenceUrl,
          };
        }),
      );

      setApplications(applicationArray);
    }

    getNewApplications();
  }, []);

  // handle Reject button press
  // update reason and status columns on driver_verification table
  async function handleReject(id: string) {
    if (text === "" || !text) {
      return Alert.alert("Please enter a reason for rejection.");
    }

    const { error } = await supabase
      .from("driver_verification")
      .update({
        rejection_reason: text,
        status: "rejected",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
    setApplications(
      applications.filter((application) => application.id !== id),
    );
  }

  // handle Verify button press
  // update status on driver_verification table
  async function handleVerify(id: string) {
    const { error } = await supabase
      .from("driver_verification")
      .update({ status: "verified", reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    setApplications(
      applications.filter((application) => application.id !== id),
    );
  }

  if (applications.length === 0) {
    return (
      <Text variant="titleLarge" style={{ marginLeft: 20, marginTop: 8 }}>
        No driver applications to review.
      </Text>
    );
  }

  return (
    <ScrollView className="mt-4 mx-2">
      {applications.map((driver) => (
        <Card key={driver.id} mode="outlined" style={{ marginBottom: 12 }}>
          <Card.Content>
            <Text variant="titleLarge" style={{ marginBottom: 4 }}>
              {driver.name}
            </Text>
            <Text variant="bodyMedium" style={{ marginBottom: 4 }}>
              {driver.email}
            </Text>
            <Text variant="bodyMedium">Submitted on {driver.created_at}</Text>
          </Card.Content>

          {driver.licenceUrl && (
            <View className="items-start ps-2">
              <Button onPress={() => Linking.openURL(driver.licenceUrl!)}>
                View driving licence
              </Button>
            </View>
          )}
          <Card.Content>
            <TextInput
              mode="outlined"
              placeholder="Reason for rejection"
              value={text}
              onChangeText={(text) => setText(text)}
            />
          </Card.Content>
          <Card.Actions>
            <Button
              onPress={() => {
                handleReject(driver.id);
              }}
            >
              Reject
            </Button>
            <Button
              onPress={() => {
                handleVerify(driver.id);
              }}
            >
              Verify
            </Button>
          </Card.Actions>
        </Card>
      ))}
    </ScrollView>
  );
}
