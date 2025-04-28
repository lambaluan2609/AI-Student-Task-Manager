import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, ScrollView } from 'react-native';
import { Trophy, Star, Award, Target } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  progress: number;
  total: number;
}

export default function RewardsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [points, setPoints] = useState(1250);
  const [badges, setBadges] = useState<Badge[]>([
    {
      id: '1',
      title: 'Task Master',
      description: 'Complete 100 tasks',
      icon: 'trophy',
      earned: true,
      progress: 100,
      total: 100,
    },
    {
      id: '2',
      title: 'Early Bird',
      description: 'Complete 50 tasks before their deadline',
      icon: 'star',
      earned: false,
      progress: 32,
      total: 50,
    },
    {
      id: '3',
      title: 'Study Streak',
      description: 'Study for 7 days in a row',
      icon: 'award',
      earned: false,
      progress: 3,
      total: 7,
    },
    {
      id: '4',
      title: 'Flashcard Pro',
      description: 'Review 500 flashcards',
      icon: 'target',
      earned: false,
      progress: 150,
      total: 500,
    },
  ]);

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'trophy':
        return <Trophy size={24} color={isDark ? '#fff' : '#000'} />;
      case 'star':
        return <Star size={24} color={isDark ? '#fff' : '#000'} />;
      case 'award':
        return <Award size={24} color={isDark ? '#fff' : '#000'} />;
      case 'target':
        return <Target size={24} color={isDark ? '#fff' : '#000'} />;
      default:
        return <Trophy size={24} color={isDark ? '#fff' : '#000'} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <LinearGradient
        colors={isDark ? ['#1a1a1a', '#000'] : ['#f5f5f5', '#fff']}
        style={styles.header}
      >
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>
          Rewards
        </Text>
        <View style={styles.pointsContainer}>
          <Text style={[styles.pointsText, { color: isDark ? '#fff' : '#000' }]}>
            {points}
          </Text>
          <Text style={[styles.pointsLabel, { color: isDark ? '#fff' : '#000' }]}>
            Points
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
          Your Badges
        </Text>
        
        {badges.map((badge) => (
          <View
            key={badge.id}
            style={[
              styles.badgeCard,
              { backgroundColor: isDark ? '#1a1a1a' : '#fff' },
            ]}
          >
            <View style={styles.badgeIcon}>
              {getIcon(badge.icon)}
            </View>
            <View style={styles.badgeInfo}>
              <Text style={[styles.badgeTitle, { color: isDark ? '#fff' : '#000' }]}>
                {badge.title}
              </Text>
              <Text style={[styles.badgeDescription, { color: isDark ? '#666' : '#999' }]}>
                {badge.description}
              </Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(badge.progress / badge.total) * 100}%`,
                        backgroundColor: badge.earned ? '#34C759' : '#007AFF',
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: isDark ? '#fff' : '#000' }]}>
                  {badge.progress} / {badge.total}
                </Text>
              </View>
            </View>
            {badge.earned && (
              <View style={styles.earnedBadge}>
                <Text style={styles.earnedText}>Earned</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  pointsContainer: {
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 32,
    fontWeight: '700',
  },
  pointsLabel: {
    fontSize: 16,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,122,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    minWidth: 50,
    textAlign: 'right',
  },
  earnedBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  earnedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
}); 