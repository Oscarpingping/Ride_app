import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import type { Club } from '../../shared/types/club';
import { MiniClubCard } from '../components/MiniClubCard';
import { ClubModals } from '../components/club/ClubModals';
import { useClubModal } from '../context/ClubModalContext';

const CARD_MARGIN = 8;
const CARD_WIDTH = (Dimensions.get('window').width - CARD_MARGIN * 3) / 2;
const CARD_HEIGHT = 180;

interface MyClubGridProps {
  clubs: Club[];
  onCreateClub: () => void;
}

export const MyClubGrid: React.FC<MyClubGridProps> = ({ clubs, onCreateClub }) => {
  const { openModal } = useClubModal();
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  // 插入加号卡片
  const data = clubs.slice();
  if (data.length % 4 !== 3) {
    data.splice(3, 0, { _id: 'add', isAdd: true } as any);
  }

  // 2*2分组
  const rows = [];
  for (let i = 0; i < data.length; i += 2) {
    rows.push(data.slice(i, i + 2));
  }

  const handleClubPress = (club: Club) => {
    setSelectedClub(club);
    // TODO: 添加导航到俱乐部详情页的逻辑
  };

  const handleUpdateCover = () => {
    if (selectedClub) {
      openModal('UPDATE_COVER', { clubId: selectedClub._id });
    }
  };

  const handleUpdateLogo = () => {
    if (selectedClub) {
      openModal('UPDATE_LOGO', { clubId: selectedClub._id });
    }
  };

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((item: any) =>
            item.isAdd ? (
              <TouchableOpacity 
                key={item._id} 
                style={styles.addCard} 
                onPress={onCreateClub} 
                activeOpacity={0.8}
              >
                <Text style={styles.plus}>+</Text>
                <Text style={styles.addText}>Create Club</Text>
              </TouchableOpacity>
            ) : (
              <MiniClubCard 
                key={item._id} 
                club={item} 
                onPress={() => handleClubPress(item)}
              />
            )
          )}
        </View>
      ))}
      
      <ClubModals 
        visible={!!selectedClub}
        type={null}
        clubId={selectedClub?._id}
        onDismiss={() => setSelectedClub(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: CARD_MARGIN,
  },
  addCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    margin: CARD_MARGIN,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  plus: {
    fontSize: 40,
    color: '#ff6600',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  addText: {
    fontSize: 15,
    color: '#ff6600',
    fontWeight: '600',
  },
}); 