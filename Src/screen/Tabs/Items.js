import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import { useIsFocused, useNavigation } from '@react-navigation/native';

const Items = () => {
  const [items, setItems] = useState([]);
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  useEffect(() => {
    getItems();
  }, [isFocused]);

  const getItems = () => {
    firestore()
      .collection('items') // need to add admin dynmaically
      .get()
      .then(querySnapshot => {
        let tempData = [];
        querySnapshot.forEach(documentSnapshot => {
          tempData.push({
            id: documentSnapshot.id,
            data: documentSnapshot.data(),
          });
        });
        setItems(tempData);
      });
  };

  const deleteItem = docId => {
    firestore()
      .collection('items')
      .doc(docId)
      .delete()
      .then(() => {
        Alert.alert('Success', 'Item deleted successfully!', [
          {
            text: 'OK',
            onPress: () => {
              getItems();
            },
          },
        ]);
      })
      .catch(error => {
        console.error('Error deleting item:', error);
        Alert.alert('Error', 'Failed to delete item. Please try again later.');
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Item List</Text>
      <FlatList
        data={items}
        renderItem={({ item, index }) => {
          return (
            <View style={styles.itemView}>
              <Image
                source={{ uri: item.data.imageUrl }}
                style={styles.itemImage}
              />
              <View style={styles.nameView}>
                <Text style={styles.nameText}>{item.data.name}</Text>
                <Text style={styles.descText}>{item.data.description}</Text>
                <View style={styles.priceView}>
                  <Text style={styles.priceText}>
                    {'₹' + item.data.discountPrice}
                  </Text>
                  <Text style={styles.discountText}>
                    {'₹' + item.data.price}
                  </Text>
                </View>
              </View>
              <View style={{ margin: 10 }}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('Edititem', {
                      data: item.data,
                      id: item.id,
                    });
                  }}>
                  <Image
                    source={require('../Tabs/images/edit.png')}
                    style={styles.icon}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    deleteItem(item.id);
                  }}>
                  <Image
                    source={require('../Tabs/images/delete.png')}
                    style={[styles.icon, { marginTop: 10 }]} // Adjust the margin as needed
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemView: {
    flexDirection: 'row',
    width: '100%', // Use 100% to ensure all items are fully visible
    alignSelf: 'center',
    backgroundColor: '#fff',
    elevation: 4,
    marginTop: 20,
    borderRadius: 20,
    height: 100,
    marginBottom: 10,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    margin: 5,
  },
  nameView: {
    width: '53%',
    margin: 10,
  },
  priceView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'black',
  },
  descText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'black',
  },
  priceText: {
    fontSize: 18,
    color: 'green',
    fontWeight: '700',
  },
  discountText: {
    fontSize: 17,
    fontWeight: '600',
    textDecorationLine: 'line-through',
    marginLeft: 5,
    color: 'black',
  },
  icon: {
    width: 24,
    height: 24,
  },
  headerText: {
    height: 30,
    width: '100%',
    backgroundColor: 'white',
    paddingLeft: 138,
    fontSize: 21,
    fontWeight: '700',
    color: 'black',
  },
  flatList: {
   // paddingBottom: 100, // Add some padding to the bottom to accommodate the icons
  },
  FlatList: {
    marginBottom: 60, 
  },
});

export default Items;
