import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, ScrollView, Animated, Modal, TextInput, Dimensions } from 'react-native';
import { Plus, ChevronLeft, ChevronRight, Shuffle, BookOpen, X, Check, Edit2, Trash2, Star, Clock, Award, Bookmark } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, shadows } from '../theme/colors';

const { width } = Dimensions.get('window');

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed: Date | null;
  mastery: number;
  tags: string[];
  options?: string[]; // For multiple choice questions
}

interface Deck {
  id: string;
  title: string;
  description: string;
  cards: Flashcard[];
  createdAt: Date;
  lastStudied: Date | null;
  progress: number;
  totalStudyTime: number;
  averageScore: number;
}

export default function StudyScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [decks, setDecks] = useState<Deck[]>([]);
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCreatingDeck, setIsCreatingDeck] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [editCardId, setEditCardId] = useState<string | null>(null);
  const [studyMode, setStudyMode] = useState<'learn' | 'test'>('learn');
  const [studyProgress, setStudyProgress] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
    streak: 0,
    startTime: new Date()
  });
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [newCardQuestion, setNewCardQuestion] = useState('');
  const [newCardAnswer, setNewCardAnswer] = useState('');
  const [newCardCategory, setNewCardCategory] = useState('');
  const [newCardDifficulty, setNewCardDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [newCardTags, setNewCardTags] = useState<string[]>([]);
  const [newCardOptions, setNewCardOptions] = useState<string[]>(['', '', '', '']);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{
    correct: number;
    total: number;
    currentQuestion: number;
  }>({
    correct: 0,
    total: 0,
    currentQuestion: 0
  });
  const [testMode, setTestMode] = useState<'practice' | 'exam'>('practice');
  const [testTime, setTestTime] = useState<number>(0);
  const [testTimer, setTestTimer] = useState<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Load sample decks for demonstration
    const sampleDecks: Deck[] = [
      {
        id: '1',
        title: 'Math Formulas',
        description: 'Essential mathematical formulas and equations',
        cards: [
          {
            id: '1',
            question: 'Quadratic Formula',
            answer: 'x = (-b ± √(b² - 4ac)) / 2a',
            category: 'Algebra',
            difficulty: 'medium',
            lastReviewed: null,
            mastery: 0,
            tags: ['formula', 'quadratic', 'algebra'],
            options: [
              'x = (-b ± √(b² - 4ac)) / 2a',
              'x = (-b ± √(b² + 4ac)) / 2a',
              'x = (-b ± √(b² - 4ac)) / 2',
              'x = (b ± √(b² - 4ac)) / 2a'
            ]
          },
          {
            id: '2',
            question: 'Pythagorean Theorem',
            answer: 'a² + b² = c²',
            category: 'Geometry',
            difficulty: 'easy',
            lastReviewed: null,
            mastery: 0,
            tags: ['theorem', 'geometry', 'triangle'],
            options: [
              'a² + b² = c²',
              'a² - b² = c²',
              'a² + b² + c² = 0',
              'a + b + c = 180°'
            ]
          }
        ],
        createdAt: new Date(),
        lastStudied: null,
        progress: 0,
        totalStudyTime: 0,
        averageScore: 0
      }
    ];
    setDecks(sampleDecks);
  }, []);

  useEffect(() => {
    if (studyMode === 'test' && currentDeck) {
      const timer = setInterval(() => {
        setTestTime(prev => prev + 1);
      }, 1000);
      setTestTimer(timer);
    } else {
      if (testTimer) {
        clearInterval(testTimer);
        setTestTimer(null);
      }
      setTestTime(0);
    }
    return () => {
      if (testTimer) {
        clearInterval(testTimer);
      }
    };
  }, [studyMode, currentDeck]);

  useEffect(() => {
    if (currentDeck) {
      const currentProgress = (currentCardIndex + 1) / currentDeck.cards.length;
      setProgress(currentProgress);
    } else {
      setProgress(0);
    }
  }, [currentCardIndex, currentDeck]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const filteredDecks = decks.filter(deck => {
    const matchesSearch = deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
      deck.cards.some(card => selectedTags.some(tag => card.tags.includes(tag)));
    return matchesSearch && matchesTags;
  });

  const createDeck = () => {
    if (newDeckTitle.trim()) {
      const newDeck: Deck = {
        id: Date.now().toString(),
        title: newDeckTitle,
        description: newDeckDescription || 'No description',
        cards: [],
        createdAt: new Date(),
        lastStudied: null,
        progress: 0,
        totalStudyTime: 0,
        averageScore: 0
      };
      setDecks([...decks, newDeck]);
      setNewDeckTitle('');
      setNewDeckDescription('');
      setIsCreatingDeck(false);
      
      // Auto-select the new deck
      setCurrentDeck(newDeck);
    }
  };

  const deleteDeck = (deckId: string) => {
    setDecks(decks.filter(deck => deck.id !== deckId));
    if (currentDeck && currentDeck.id === deckId) {
      setCurrentDeck(null);
    }
  };

  const addCard = () => {
    if (currentDeck && newCardQuestion.trim() && newCardAnswer.trim()) {
      // Filter out empty options
      const filteredOptions = studyMode === 'test' 
        ? [newCardAnswer, ...newCardOptions.filter(opt => opt.trim() !== '' && opt.trim() !== newCardAnswer.trim())]
        : [newCardAnswer];

      // If we don't have 4 options, generate some dummy ones
      const finalOptions = filteredOptions.length >= 4 
        ? filteredOptions.slice(0, 4) 
        : [...filteredOptions, ...Array(4 - filteredOptions.length).fill('').map((_, i) => `Option ${i + 1}`)];
        
      // Shuffle the options
      const shuffledOptions = [...finalOptions].sort(() => Math.random() - 0.5);

      const newCard: Flashcard = {
        id: Date.now().toString(),
        question: newCardQuestion,
        answer: newCardAnswer,
        category: newCardCategory || 'General',
        difficulty: newCardDifficulty,
        lastReviewed: null,
        mastery: 0,
        tags: newCardTags.length > 0 ? newCardTags : ['general'],
        options: shuffledOptions
      };
      
      const updatedDeck = {
        ...currentDeck,
        cards: [...currentDeck.cards, newCard]
      };
      
      setDecks(decks.map(d => d.id === currentDeck.id ? updatedDeck : d));
      setCurrentDeck(updatedDeck);
      resetCardForm();
      setIsAddingCard(false);
    }
  };

  const editCard = () => {
    if (currentDeck && editCardId && newCardQuestion.trim() && newCardAnswer.trim()) {
      const filteredOptions = studyMode === 'test' 
        ? [newCardAnswer, ...newCardOptions.filter(opt => opt.trim() !== '' && opt.trim() !== newCardAnswer.trim())]
        : [newCardAnswer];

      const finalOptions = filteredOptions.length >= 4 
        ? filteredOptions.slice(0, 4) 
        : [...filteredOptions, ...Array(4 - filteredOptions.length).fill('').map((_, i) => `Option ${i + 1}`)];
      
      const shuffledOptions = [...finalOptions].sort(() => Math.random() - 0.5);

      const updatedCards = currentDeck.cards.map(card => {
        if (card.id === editCardId) {
          return {
            ...card,
            question: newCardQuestion,
            answer: newCardAnswer,
            category: newCardCategory || card.category,
            difficulty: newCardDifficulty,
            tags: newCardTags.length > 0 ? newCardTags : card.tags,
            options: shuffledOptions
          };
        }
        return card;
      });
      
      const updatedDeck = {
        ...currentDeck,
        cards: updatedCards
      };
      
      setDecks(decks.map(d => d.id === currentDeck.id ? updatedDeck : d));
      setCurrentDeck(updatedDeck);
      resetCardForm();
      setIsEditingCard(false);
      setEditCardId(null);
    }
  };

  const deleteCard = (cardId: string) => {
    if (currentDeck) {
      const updatedCards = currentDeck.cards.filter(card => card.id !== cardId);
      const updatedDeck = {
        ...currentDeck,
        cards: updatedCards
      };
      
      setDecks(decks.map(d => d.id === currentDeck.id ? updatedDeck : d));
      setCurrentDeck(updatedDeck);
      
      // If we're deleting the current card, adjust the index
      if (currentCardIndex >= updatedCards.length) {
        setCurrentCardIndex(Math.max(0, updatedCards.length - 1));
      }
    }
  };

  const resetCardForm = () => {
    setNewCardQuestion('');
    setNewCardAnswer('');
    setNewCardCategory('');
    setNewCardDifficulty('medium');
    setNewCardTags([]);
    setNewCardOptions(['', '', '', '']);
  };

  const startEditingCard = (card: Flashcard) => {
    setEditCardId(card.id);
    setNewCardQuestion(card.question);
    setNewCardAnswer(card.answer);
    setNewCardCategory(card.category);
    setNewCardDifficulty(card.difficulty);
    setNewCardTags([...card.tags]);
    
    // Set options, ensuring we have exactly 4
    if (card.options && card.options.length > 0) {
      // Filter out the correct answer
      const otherOptions = card.options.filter(opt => opt !== card.answer);
      // Create an array with the correct answer and up to 3 other options
      const optionsToSet = [...otherOptions.slice(0, 3)];
      // Pad with empty strings if needed
      while (optionsToSet.length < 3) {
        optionsToSet.push('');
      }
      setNewCardOptions(optionsToSet);
    } else {
      setNewCardOptions(['', '', '', '']);
    }
    
    setIsEditingCard(true);
  };

  // Card options input component for test mode
  const renderCardOptionsInputs = () => {
    if (studyMode !== 'test') return null;

    return (
      <View style={styles.optionsInputContainer}>
        <Text style={[styles.inputLabel, { color: isDark ? colors.text.light : colors.text.primary }]}>
          Multiple Choice Options (correct answer will be added automatically)
        </Text>
        {newCardOptions.slice(0, 3).map((option, index) => (
          <View key={index} style={styles.optionInputRow}>
            <Text style={styles.optionLabel}>{String.fromCharCode(66 + index)}.</Text>
            <TextInput
              style={[styles.optionInput, { color: isDark ? colors.text.light : colors.text.primary }]}
              placeholder={`Option ${index + 2}`}
              placeholderTextColor={isDark ? colors.text.light : colors.text.secondary}
              value={option}
              onChangeText={(text) => {
                const newOptions = [...newCardOptions];
                newOptions[index] = text;
                setNewCardOptions(newOptions);
              }}
            />
          </View>
        ))}
      </View>
    );
  };

  const rateCard = (rating: 'correct' | 'incorrect') => {
    if (currentDeck) {
      const updatedCards = currentDeck.cards.map((card, index) => {
        if (index === currentCardIndex) {
          const newMastery = rating === 'correct' 
            ? Math.min(100, card.mastery + 20)
            : Math.max(0, card.mastery - 10);
          return {
            ...card,
            lastReviewed: new Date(),
            mastery: newMastery
          };
        }
        return card;
      });

      const updatedDeck = {
        ...currentDeck,
        cards: updatedCards,
        lastStudied: new Date(),
        progress: updatedCards.reduce((sum, card) => sum + card.mastery, 0) / updatedCards.length,
        totalStudyTime: currentDeck.totalStudyTime + 
          (new Date().getTime() - studyProgress.startTime.getTime()) / 1000,
        averageScore: (currentDeck.averageScore * currentDeck.cards.length + 
          (rating === 'correct' ? 1 : 0)) / (currentDeck.cards.length + 1)
      };

      setDecks(decks.map(d => d.id === currentDeck.id ? updatedDeck : d));
      setCurrentDeck(updatedDeck);
      setStudyProgress({
        ...studyProgress,
        [rating]: studyProgress[rating] + 1,
        total: studyProgress.total + 1,
        streak: rating === 'correct' ? studyProgress.streak + 1 : 0,
        startTime: new Date()
      });

      if (studyMode === 'test' && currentCardIndex < currentDeck.cards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setIsFlipped(false);
      }
    }
  };

  const exitStudy = () => {
    setCurrentDeck(null);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowAnswer(false);
    setSelectedOption(null);
    setTestResults({ correct: 0, total: 0, currentQuestion: 0 });
  };

  const handleTestAnswer = (option: string) => {
    if (!currentDeck || !currentDeck.cards[currentCardIndex]) return;
    
    setSelectedOption(option);
    const isCorrect = option === currentDeck.cards[currentCardIndex].answer;
    
    if (isCorrect) {
      setTestResults(prev => ({
        ...prev,
        correct: prev.correct + 1
      }));
    }

    // Update card mastery
    const updatedCards = currentDeck.cards.map((card, index) => {
      if (index === currentCardIndex) {
        const newMastery = isCorrect 
          ? Math.min(100, card.mastery + 20)
          : Math.max(0, card.mastery - 10);
        return {
          ...card,
          lastReviewed: new Date(),
          mastery: newMastery
        };
      }
      return card;
    });

    const updatedDeck = {
      ...currentDeck,
      cards: updatedCards,
      lastStudied: new Date(),
      progress: updatedCards.reduce((sum, card) => sum + card.mastery, 0) / updatedCards.length
    };

    setDecks(decks.map(d => d.id === currentDeck.id ? updatedDeck : d));
    setCurrentDeck(updatedDeck);

    // Move to next question after a delay
    setTimeout(() => {
      if (currentCardIndex < currentDeck.cards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setSelectedOption(null);
        setTestResults(prev => ({
          ...prev,
          currentQuestion: prev.currentQuestion + 1
        }));
      } else {
        // Test completed
        setTestResults(prev => ({
          ...prev,
          total: currentDeck.cards.length
        }));
      }
    }, 1000);
  };

  const renderDeckCard = (deck: Deck) => (
    <TouchableOpacity
      key={deck.id}
      style={[styles.deckCard, { backgroundColor: isDark ? colors.background.cardDark : colors.background.card }]}
      onPress={() => {
        setCurrentDeck(deck);
        setCurrentCardIndex(0);
        setShowAnswer(false);
        setSelectedOption(null);
        setTestResults({ correct: 0, total: 0, currentQuestion: 0 });
      }}
    >
      <View style={styles.deckHeader}>
        <View style={styles.deckTitleContainer}>
          <Text style={[styles.deckTitle, { color: isDark ? colors.text.light : colors.text.primary }]}>
            {deck.title}
          </Text>
          <View style={styles.deckStats}>
            <View style={styles.statItem}>
              <BookOpen size={16} color={isDark ? colors.text.light : colors.text.secondary} />
              <Text style={[styles.statText, { color: isDark ? colors.text.light : colors.text.secondary }]}>
                {deck.cards.length}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Star size={16} color={isDark ? colors.text.light : colors.text.secondary} />
              <Text style={[styles.statText, { color: isDark ? colors.text.light : colors.text.secondary }]}>
                {Math.round(deck.progress)}%
              </Text>
            </View>
            <View style={styles.statItem}>
              <Clock size={16} color={isDark ? colors.text.light : colors.text.secondary} />
              <Text style={[styles.statText, { color: isDark ? colors.text.light : colors.text.secondary }]}>
                {Math.round(deck.totalStudyTime / 60)}m
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.deckActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setCurrentDeck(deck);
              setIsAddingCard(true);
            }}
          >
            <Plus size={20} color={isDark ? colors.text.light : colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              if (confirm('Are you sure you want to delete this deck?')) {
                deleteDeck(deck.id);
              }
            }}
          >
            <Trash2 size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={[styles.deckDescription, { color: isDark ? colors.text.light : colors.text.secondary }]}>
        {deck.description}
      </Text>
      <View style={styles.deckTags}>
        {Array.from(new Set(deck.cards.flatMap(card => card.tags))).slice(0, 3).map(tag => (
          <View key={tag} style={[styles.tag, { backgroundColor: isDark ? colors.background.dark : colors.background.light }]}>
            <Text style={[styles.tagText, { color: isDark ? colors.text.light : colors.text.primary }]}>
              {tag}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  const renderStudyCard = () => {
    if (!currentDeck || !currentDeck.cards.length) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={[styles.emptyStateText, { color: isDark ? colors.text.light : colors.text.primary }]}>
            No cards in this deck
          </Text>
          <TouchableOpacity 
            style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
            onPress={() => setIsAddingCard(true)}
          >
            <Text style={styles.emptyStateButtonText}>Add a Card</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.emptyStateButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary }]}
            onPress={() => setCurrentDeck(null)}
          >
            <Text style={[styles.emptyStateButtonText, { color: colors.primary }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const currentCard = currentDeck.cards[currentCardIndex];
    const progress = (currentCardIndex + 1) / currentDeck.cards.length;

    return (
      <View style={styles.studyContainer}>
        {studyMode === 'test' && renderTestMode()}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.exitButton}
            onPress={() => {
              setCurrentDeck(null);
              setCurrentCardIndex(0);
              setShowAnswer(false);
              setSelectedOption(null);
              setTestResults({ correct: 0, total: 0, currentQuestion: 0 });
            }}
          >
            <X size={24} color={isDark ? colors.text.light : colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.deckTitle, { color: isDark ? colors.text.light : colors.text.primary }]}>
            {currentDeck.title}
          </Text>
          <Text style={[styles.progressText, { color: isDark ? colors.text.light : colors.text.secondary }]}>
            {currentCardIndex + 1}/{currentDeck.cards.length}
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        
        <View style={styles.cardContainer}>
          <View style={[styles.card, { backgroundColor: isDark ? colors.background.cardDark : colors.background.card }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardCategory, { color: isDark ? colors.text.light : colors.text.secondary }]}>
                  {currentCard.category}
                </Text>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(currentCard.difficulty) }]}>
                  <Text style={styles.difficultyText}>
                    {currentCard.difficulty}
                  </Text>
                </View>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity 
                  style={styles.cardAction}
                  onPress={() => startEditingCard(currentCard)}
                >
                  <Edit2 size={18} color={isDark ? colors.text.light : colors.text.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.cardAction}
                  onPress={() => {
                    if (confirm('Are you sure you want to delete this card?')) {
                      deleteCard(currentCard.id);
                    }
                  }}
                >
                  <Trash2 size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
            
            <Text style={[styles.cardText, { color: isDark ? colors.text.light : colors.text.primary }]}>
              {currentCard.question}
            </Text>

            {studyMode === 'test' ? (
              <View style={styles.optionsContainer}>
                {currentCard.options?.map((option, index) => {
                  const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.optionButton,
                        selectedOption === option && styles.selectedOption,
                        selectedOption && option === currentCard.answer && styles.correctOption,
                        selectedOption && option !== currentCard.answer && selectedOption === option && styles.incorrectOption
                      ]}
                      onPress={() => !selectedOption && handleTestAnswer(option)}
                      disabled={!!selectedOption}
                    >
                      <Text style={styles.optionLetter}>{optionLetter}</Text>
                      <Text style={[
                        styles.optionText,
                        selectedOption === option && styles.selectedOptionText,
                        selectedOption && option === currentCard.answer && styles.correctOptionText
                      ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <>
                {showAnswer && (
                  <View style={styles.answerContainer}>
                    <Text style={[styles.answerText, { color: isDark ? colors.text.light : colors.text.primary }]}>
                      {currentCard.answer}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.showAnswerButton}
                  onPress={() => setShowAnswer(!showAnswer)}
                >
                  <Text style={styles.showAnswerText}>
                    {showAnswer ? 'Hide Answer' : 'Show Answer'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {studyMode === 'test' && (
          <View style={styles.testStats}>
            <Text style={[styles.testStatText, { color: isDark ? colors.text.light : colors.text.primary }]}>
              Score: {testResults.correct}/{testResults.currentQuestion + 1}
            </Text>
          </View>
        )}

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, { opacity: currentCardIndex === 0 ? 0.5 : 1 }]}
            onPress={() => {
              if (currentCardIndex > 0) {
                setCurrentCardIndex(currentCardIndex - 1);
                setShowAnswer(false);
                setSelectedOption(null);
              }
            }}
            disabled={currentCardIndex === 0}
          >
            <ChevronLeft size={24} color={isDark ? colors.text.light : colors.text.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, { opacity: currentCardIndex === currentDeck.cards.length - 1 ? 0.5 : 1 }]}
            onPress={() => {
              if (currentCardIndex < currentDeck.cards.length - 1) {
                setCurrentCardIndex(currentCardIndex + 1);
                setShowAnswer(false);
                setSelectedOption(null);
              }
            }}
            disabled={currentCardIndex === currentDeck.cards.length - 1}
          >
            <ChevronRight size={24} color={isDark ? colors.text.light : colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTestMode = () => {
    if (!currentDeck) return null;

    return (
      <View style={styles.testModeContainer}>
        <View style={styles.testModeHeader}>
          <Text style={[styles.testModeTitle, { color: isDark ? colors.text.light : colors.text.primary }]}>
            Test Mode
          </Text>
          <View style={styles.testModeSelector}>
            <TouchableOpacity
              style={[styles.testModeButton, testMode === 'practice' && styles.activeTestModeButton]}
              onPress={() => setTestMode('practice')}
            >
              <Text style={[styles.testModeText, testMode === 'practice' && styles.activeTestModeText]}>
                Practice
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.testModeButton, testMode === 'exam' && styles.activeTestModeButton]}
              onPress={() => setTestMode('exam')}
            >
              <Text style={[styles.testModeText, testMode === 'exam' && styles.activeTestModeText]}>
                Exam
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.testStats}>
          <View style={styles.testStatItem}>
            <Text style={[styles.testStatLabel, { color: isDark ? colors.text.light : colors.text.secondary }]}>
              Score
            </Text>
            <Text style={[styles.testStatValue, { color: isDark ? colors.text.light : colors.text.primary }]}>
              {testResults.correct}/{testResults.currentQuestion + 1}
            </Text>
          </View>
          <View style={styles.testStatItem}>
            <Text style={[styles.testStatLabel, { color: isDark ? colors.text.light : colors.text.secondary }]}>
              Time
            </Text>
            <Text style={[styles.testStatValue, { color: isDark ? colors.text.light : colors.text.primary }]}>
              {formatTime(testTime)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const modeSelector = (
    <View style={styles.modeSelector}>
      <TouchableOpacity
        style={[styles.modeButton, studyMode === 'learn' && styles.activeModeButton]}
        onPress={() => {
          setStudyMode('learn');
          if (currentDeck) {
            setShowAnswer(false);
            setCurrentCardIndex(0);
          }
        }}
      >
        <Text style={[styles.modeText, studyMode === 'learn' && styles.activeModeText]}>
          Learn
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.modeButton, studyMode === 'test' && styles.activeModeButton]}
        onPress={() => {
          setStudyMode('test');
          if (currentDeck) {
            setSelectedOption(null);
            setCurrentCardIndex(0);
            setTestResults({ correct: 0, total: 0, currentQuestion: 0 });
          }
        }}
      >
        <Text style={[styles.modeText, studyMode === 'test' && styles.activeModeText]}>
          Test
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background.dark : colors.background.light }]}>
      <LinearGradient
        colors={[
          (isDark ? gradients.background.dark : gradients.background.light)[0],
          (isDark ? gradients.background.dark : gradients.background.light)[1]
        ]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: isDark ? colors.text.light : colors.text.primary }]}>
            Study
          </Text>
          {modeSelector}
        </View>
      </LinearGradient>

      {currentDeck ? (
        renderStudyCard()
      ) : (
        <View style={styles.deckListContainer}>
          <ScrollView style={styles.deckList}>
            <View style={styles.searchContainer}>
              <TextInput
                style={[styles.searchInput, { color: isDark ? colors.text.light : colors.text.primary }]}
                placeholder="Search decks..."
                placeholderTextColor={isDark ? colors.text.light : colors.text.secondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            {decks.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Text style={[styles.emptyStateText, { color: isDark ? colors.text.light : colors.text.primary }]}>
                  You don't have any decks yet
                </Text>
                <TouchableOpacity 
                  style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
                  onPress={() => setIsCreatingDeck(true)}
                >
                  <Text style={styles.emptyStateButtonText}>Create Your First Deck</Text>
                </TouchableOpacity>
              </View>
            ) : (
              decks.map(renderDeckCard)
            )}
          </ScrollView>
          <TouchableOpacity
            style={[styles.addButton, shadows.large]}
            onPress={() => setIsCreatingDeck(true)}
          >
            <LinearGradient
              colors={[gradients.primary[0], gradients.primary[1]]}
              style={styles.addButtonGradient}
            >
              <Plus size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={isCreatingDeck}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCreatingDeck(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? colors.background.dark : colors.background.light }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? colors.text.light : colors.text.primary }]}>
                Create New Deck
              </Text>
              <TouchableOpacity onPress={() => setIsCreatingDeck(false)}>
                <X size={24} color={isDark ? colors.text.light : colors.text.primary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.inputLabel, { color: isDark ? colors.text.light : colors.text.primary }]}>Deck Title</Text>
            <TextInput
              style={[styles.input, { color: isDark ? colors.text.light : colors.text.primary }]}
              placeholder="Enter a title for your deck"
              placeholderTextColor={isDark ? colors.text.light : colors.text.secondary}
              value={newDeckTitle}
              onChangeText={setNewDeckTitle}
            />
            <Text style={[styles.inputLabel, { color: isDark ? colors.text.light : colors.text.primary }]}>Description</Text>
            <TextInput
              style={[styles.input, { color: isDark ? colors.text.light : colors.text.primary }]}
              placeholder="Enter a description (optional)"
              placeholderTextColor={isDark ? colors.text.light : colors.text.secondary}
              value={newDeckDescription}
              onChangeText={setNewDeckDescription}
              multiline
            />
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={createDeck}
            >
              <Text style={styles.submitButtonText}>Create Deck</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isAddingCard}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddingCard(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? colors.background.dark : colors.background.light }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? colors.text.light : colors.text.primary }]}>
                Add New Card
              </Text>
              <TouchableOpacity onPress={() => {
                resetCardForm();
                setIsAddingCard(false);
              }}>
                <X size={24} color={isDark ? colors.text.light : colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              <Text style={[styles.inputLabel, { color: isDark ? colors.text.light : colors.text.primary }]}>Question</Text>
              <TextInput
                style={[styles.input, { color: isDark ? colors.text.light : colors.text.primary }]}
                placeholder="Enter your question"
                placeholderTextColor={isDark ? colors.text.light : colors.text.secondary}
                value={newCardQuestion}
                onChangeText={setNewCardQuestion}
                multiline
              />
              <Text style={[styles.inputLabel, { color: isDark ? colors.text.light : colors.text.primary }]}>
                {studyMode === 'test' ? 'Correct Answer (Option A)' : 'Answer'}
              </Text>
              <TextInput
                style={[styles.input, { color: isDark ? colors.text.light : colors.text.primary }]}
                placeholder="Enter the answer"
                placeholderTextColor={isDark ? colors.text.light : colors.text.secondary}
                value={newCardAnswer}
                onChangeText={setNewCardAnswer}
                multiline
              />
              
              {renderCardOptionsInputs()}
              
              <Text style={[styles.inputLabel, { color: isDark ? colors.text.light : colors.text.primary }]}>Category</Text>
              <TextInput
                style={[styles.input, { color: isDark ? colors.text.light : colors.text.primary }]}
                placeholder="Category (optional)"
                placeholderTextColor={isDark ? colors.text.light : colors.text.secondary}
                value={newCardCategory}
                onChangeText={setNewCardCategory}
              />
              
              <Text style={[styles.inputLabel, { color: isDark ? colors.text.light : colors.text.primary }]}>Difficulty</Text>
              <View style={styles.difficultySelector}>
                {(['easy', 'medium', 'hard'] as const).map(difficulty => (
                  <TouchableOpacity
                    key={difficulty}
                    style={[
                      styles.difficultyButton,
                      newCardDifficulty === difficulty && styles.activeDifficultyButton
                    ]}
                    onPress={() => setNewCardDifficulty(difficulty)}
                  >
                    <Text style={[
                      styles.difficultyButtonText,
                      newCardDifficulty === difficulty && styles.activeDifficultyButtonText
                    ]}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={addCard}
              >
                <Text style={styles.submitButtonText}>Add Card</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isEditingCard}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          resetCardForm();
          setIsEditingCard(false);
          setEditCardId(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? colors.background.dark : colors.background.light }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? colors.text.light : colors.text.primary }]}>
                Edit Card
              </Text>
              <TouchableOpacity onPress={() => {
                resetCardForm();
                setIsEditingCard(false);
                setEditCardId(null);
              }}>
                <X size={24} color={isDark ? colors.text.light : colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              <Text style={[styles.inputLabel, { color: isDark ? colors.text.light : colors.text.primary }]}>Question</Text>
              <TextInput
                style={[styles.input, { color: isDark ? colors.text.light : colors.text.primary }]}
                placeholder="Enter your question"
                placeholderTextColor={isDark ? colors.text.light : colors.text.secondary}
                value={newCardQuestion}
                onChangeText={setNewCardQuestion}
                multiline
              />
              <Text style={[styles.inputLabel, { color: isDark ? colors.text.light : colors.text.primary }]}>
                {studyMode === 'test' ? 'Correct Answer (Option A)' : 'Answer'}
              </Text>
              <TextInput
                style={[styles.input, { color: isDark ? colors.text.light : colors.text.primary }]}
                placeholder="Enter the answer"
                placeholderTextColor={isDark ? colors.text.light : colors.text.secondary}
                value={newCardAnswer}
                onChangeText={setNewCardAnswer}
                multiline
              />
              
              {renderCardOptionsInputs()}
              
              <Text style={[styles.inputLabel, { color: isDark ? colors.text.light : colors.text.primary }]}>Category</Text>
              <TextInput
                style={[styles.input, { color: isDark ? colors.text.light : colors.text.primary }]}
                placeholder="Category (optional)"
                placeholderTextColor={isDark ? colors.text.light : colors.text.secondary}
                value={newCardCategory}
                onChangeText={setNewCardCategory}
              />
              
              <Text style={[styles.inputLabel, { color: isDark ? colors.text.light : colors.text.primary }]}>Difficulty</Text>
              <View style={styles.difficultySelector}>
                {(['easy', 'medium', 'hard'] as const).map(difficulty => (
                  <TouchableOpacity
                    key={difficulty}
                    style={[
                      styles.difficultyButton,
                      newCardDifficulty === difficulty && styles.activeDifficultyButton
                    ]}
                    onPress={() => setNewCardDifficulty(difficulty)}
                  >
                    <Text style={[
                      styles.difficultyButtonText,
                      newCardDifficulty === difficulty && styles.activeDifficultyButtonText
                    ]}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={editCard}
              >
                <Text style={styles.submitButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getDifficultyColor(difficulty: 'easy' | 'medium' | 'hard'): string {
  switch (difficulty) {
    case 'easy':
      return colors.success;
    case 'medium':
      return colors.warning;
    case 'hard':
      return colors.danger;
    default:
      return colors.primary;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  activeModeButton: {
    backgroundColor: colors.primary,
  },
  modeText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  activeModeText: {
    color: '#fff',
  },
  searchContainer: {
    padding: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  deckList: {
    flex: 1,
  },
  deckCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    ...shadows.small,
  },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deckTitleContainer: {
    flex: 1,
  },
  deckTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  deckStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
  },
  deckActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  deckDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  deckTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
  },
  studyContainer: {
    flex: 1,
    padding: 20,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    padding: 20,
    borderRadius: 16,
    ...shadows.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardCategory: {
    fontSize: 14,
    fontWeight: '500',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cardAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  optionsContainer: {
    marginTop: 20,
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  optionLetter: {
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
    width: 20,
    textAlign: 'center',
    color: colors.primary,
  },
  selectedOption: {
    backgroundColor: colors.primary,
  },
  correctOption: {
    backgroundColor: colors.success,
  },
  incorrectOption: {
    backgroundColor: colors.danger,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  selectedOptionText: {
    color: '#fff',
  },
  correctOptionText: {
    color: '#fff',
  },
  answerContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  answerText: {
    fontSize: 16,
    textAlign: 'center',
  },
  showAnswerButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  showAnswerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  optionsInputContainer: {
    marginBottom: 16,
  },
  optionInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionLabel: {
    width: 20,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    color: colors.primary,
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  difficultySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  activeDifficultyButton: {
    backgroundColor: colors.primary,
  },
  difficultyButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  activeDifficultyButtonText: {
    color: '#fff',
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deckListContainer: {
    flex: 1,
    position: 'relative',
  },
  testModeContainer: {
    marginBottom: 20,
  },
  testModeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  testModeTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  testModeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
    padding: 4,
  },
  testModeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  activeTestModeButton: {
    backgroundColor: colors.primary,
  },
  testModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  activeTestModeText: {
    color: '#fff',
  },
  testStats: {
    marginTop: 20,
    alignItems: 'center',
  },
  testStatText: {
    fontSize: 18,
    fontWeight: '600',
  },
  testStatItem: {
    alignItems: 'center',
  },
  testStatLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  testStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyStateButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
    maxWidth: 300,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 