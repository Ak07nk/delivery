import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';

import React, {useEffect, useState} from 'react';
import Header from '../../../Common/Header';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused, useNavigation} from '@react-navigation/native';

const Main = () => {
  const [items, setItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [userId, setuserId] = useState('');
  useEffect(() => {
    firestore()
      .collection('items')
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
  }, []);

  const getCartItems = async () => {
    let userId = await AsyncStorage.getItem('USERID');
    setuserId(userId);
    const user = await firestore().collection('users').doc(userId).get();
    setCartCount(user._data.cart.length);
  };

  useEffect(() => {
    getCartItems();
  }, [isFocused]);

  const onAddToCart = async (item, index) => {
    const user = await firestore().collection('users').doc(userId).get();
    let tempCart = [];
    tempCart = user.data().cart;

    if (tempCart.length > 0) {
      const existingItem = tempCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        existingItem.qty += 1;
      } else {
        let newItem = {...item.data, qty: 1, id: item.id};
        tempCart.push(newItem);
      }

      await firestore().collection('users').doc(userId).update({
        cart: tempCart,
      });
    } else {
      let newItem = {...item.data, qty: 1, id: item.id};
      tempCart.push(newItem);
      await firestore().collection('users').doc(userId).update({
        cart: tempCart,
      });
    }

    getCartItems();
  };

  return (
    <View style={styles.container}>
      <Header
        title={'Application name'}
        icon={require('../images/add.png')}
        count={cartCount}
        onClickIcon={() => {
          navigation.navigate('Cart');
        }}
      />
      <FlatList
        data={items}
        renderItem={({item, index}) => {
          return (
            <View style={styles.itemView}>
              <Image
                source={{uri: item.data.imageUrl}}
                style={styles.itemImage}
              />
              <View style={styles.itemInfo}>
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
              <TouchableOpacity
                style={styles.addToCartBtn}
                onPress={() => {
                  onAddToCart(item, userId);
                }}>
                <Text style={{color: '#fff'}}>Add To cart</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        style={styles.flatList}
      />
    </View>
  );
};

export default Main;

const styles = StyleSheet.create({
  container: {flex: 1},
  itemView: {
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    elevation: 4,
    marginTop: 10,
    borderRadius: 10,
    height: 120,
    marginBottom: 10,
    alignItems: 'center',
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    margin: 5,
  },
  itemInfo: {
    width: '30%',
    margin: 10,
  },
  flatList: {
    marginBottom: 60, // Adjust the margin to give space to the bottom tab
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
    color: 'grey',
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
    color: 'red',
  },
  addToCartBtn: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 10,
  },
});
