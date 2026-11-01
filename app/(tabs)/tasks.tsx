import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../src/services/supabase';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (err: any) {
      console.error('Error fetching tasks:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const toggleTaskCompletion = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));
    } catch (err: any) {
      alert('Failed to update task: ' + err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Tasks 📝</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchTasks}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : tasks.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No tasks yet. Use the Home screen AI planner to create some!</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.taskCard, item.is_completed && styles.completedCard]}
              onPress={() => toggleTaskCompletion(item.id, item.is_completed)}
            >
              <View style={styles.taskRow}>
                <Text style={[styles.taskTitle, item.is_completed && styles.completedText]}>
                  {item.is_completed ? '✅ ' : '⏳ '}{item.title}
                </Text>
              </View>
              {item.description ? <Text style={styles.taskDesc}>{item.description}</Text> : null}
              <Text style={styles.taskMeta}>
                ⏱️ {item.duration_mins} mins | Priority: {item.priority}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  refreshButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#EEF2FF', borderRadius: 6 },
  refreshText: { color: '#4F46E5', fontWeight: '600', fontSize: 13 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { textAlign: 'center', color: '#6B7280', fontSize: 15 },
  listContainer: { padding: 16 },
  taskCard: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, elevation: 1, borderWidth: 1, borderColor: '#E5E7EB' },
  completedCard: { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' },
  taskRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  taskTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', flex: 1 },
  completedText: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  taskDesc: { fontSize: 13, color: '#4B5563', marginTop: 4 },
  taskMeta: { fontSize: 12, color: '#6B7280', marginTop: 8 }
});
