import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { breakdownGoalWithAI } from '../../src/services/aiService';
import { supabase } from '../../src/services/supabase';

export default function HomeScreen() {
  const [goalInput, setGoalInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const handleQuickPlan = async () => {
    if (!goalInput.trim()) return;
    setLoading(true);
    setAiResult(null);
    try {
      const result = await breakdownGoalWithAI(goalInput);
      setAiResult(result);
    } catch (err) {
      alert('Failed to generate plan. Check your Gemini API key in .env');
    } finally {
      setLoading(false);
    }
  };

  const savePlanToDatabase = async () => {
    if (!aiResult) return;
    setSaving(true);
    try {
      // 1. Get current authenticated user (or handle mock user if auth isn't enforced yet)
      const { data: { user } } = await supabase.auth.getUser();
      
      // If no user session exists, let's sign in anonymously or alert
      if (!user) {
        alert('Please ensure you are signed in or authenticated to save tasks.');
        setSaving(false);
        return;
      }

      // 2. Insert the goal first
      const { data: goalData, error: goalError } = await supabase
        .from('goals')
        .insert({ user_id: user.id, title: aiResult.goalTitle })
        .select()
        .single();

      if (goalError) throw goalError;

      // 3. Map and insert all subtasks linked to this goal
      const tasksToInsert = aiResult.subtasks.map((task: any) => ({
        user_id: user.id,
        goal_id: goalData ? goalData.id : null,
        title: task.title,
        description: task.description || '',
        duration_mins: task.durationMins || 30,
        priority: task.priority || 'medium',
        energy_required: task.energyRequired || 'medium',
      }));

      const { error: taskError } = await supabase
        .from('tasks')
        .insert(tasksToInsert);

      if (taskError) throw taskError;

      alert('🎉 Plan saved successfully! Check your Tasks tab.');
      setAiResult(null);
      setGoalInput('');
    } catch (err: any) {
      alert('Error saving to database: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Greeting */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, friend 👋</Text>
          <Text style={styles.tagline}>Life, organised around you.</Text>
        </View>

        {/* Energy Check-in Widget */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How is your energy today?</Text>
          <View style={styles.energyRow}>
            {['🔋 Low', '⚡ Medium', '🚀 High'].map((level, idx) => (
              <TouchableOpacity key={idx} style={styles.energyButton}>
                <Text style={styles.energyText}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Quick Capture & Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✨ What do you need to achieve?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Finish essay by Friday, do laundry..."
            placeholderTextColor="#888"
            value={goalInput}
            onChangeText={setGoalInput}
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handleQuickPlan} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Generate AI Plan</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* AI Results & Save Action */}
        {aiResult && (
          <View style={styles.resultCard}>
            <Text style={styles.resultHeader}>Suggested Plan: {aiResult.goalTitle}</Text>
            {aiResult.subtasks.map((task: any, index: number) => (
              <View key={index} style={styles.subtaskItem}>
                <Text style={styles.subtaskTitle}>• {task.title}</Text>
                <Text style={styles.subtaskMeta}>
                  ⏱️ {task.durationMins} mins | Priority: {task.priority} | Energy: {task.energyRequired}
                </Text>
              </View>
            ))}

            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={savePlanToDatabase}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>📥 Add Plan to My Tasks</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { padding: 20 },
  header: { marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  tagline: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  energyRow: { flexDirection: 'row', justifyContent: 'space-between' },
  energyButton: { flex: 1, backgroundColor: '#F3F4F6', padding: 10, borderRadius: 8, marginHorizontal: 4, alignItems: 'center' },
  energyText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 14, color: '#111827', marginBottom: 12 },
  primaryButton: { backgroundColor: '#4F46E5', borderRadius: 8, padding: 12, alignItems: 'center', justifyContent: 'center', height: 44 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  resultCard: { backgroundColor: '#EEF2FF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#C7D2FE', marginTop: 8 },
  resultHeader: { fontSize: 16, fontWeight: '700', color: '#312E81', marginBottom: 12 },
  subtaskItem: { marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#E0E7FF', paddingBottom: 8 },
  subtaskTitle: { fontSize: 14, fontWeight: '500', color: '#1E1B4B' },
  subtaskMeta: { fontSize: 12, color: '#4338CA', marginTop: 4 },
  saveButton: { backgroundColor: '#059669', borderRadius: 8, padding: 12, alignItems: 'center', justifyContent: 'center', marginTop: 16, height: 44 },
  saveButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 }
});
