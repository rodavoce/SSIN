package main

import (
	"bytes"
	"encoding/gob"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"time"
)

// Block struct to  represent nodes in the BlockChain
type Block struct {
	Timestamp     int64  //Current timestamp
	Data          []byte //Actual value information containing in the block
	PrevBlockHash []byte //Stores the hash of the previous block
	Hash          []byte //Hash of the block
	Nonce         int
}

//Serialize serializes the block
func (b *Block) Serialize() []byte {
	var result bytes.Buffer
	encoder := gob.NewEncoder(&result)

	err := encoder.Encode(b)
	if err != nil {
		log.Panic(err)
	}

	return result.Bytes()
}

// DeserializeBlock deserializes a block
func DeserializeBlock(d []byte) *Block {
	var block Block

	decoder := gob.NewDecoder(bytes.NewReader(d))
	err := decoder.Decode(&block)
	if err != nil {
		log.Panic(err)
	}

	return &block
}

// NewBlock creates and returns Block
func NewBlock(data string, prevBlockHash []byte) *Block {
	block := &Block{time.Now().Unix(), []byte(data), prevBlockHash, []byte{}, 0}

	pow := NewProofOfWork(block)
	nonce, hash := pow.Run()

	block.Hash = hash[:]
	block.Nonce = nonce

	return block
}

//NewGenesisBlock create and return a genesis block
func NewGenesisBlock() *Block {
	return NewBlock("Genisis Block", []byte{})
}

func getBlockData(filename string, prevBlockHash []byte) *Block {
	databytes, err := ioutil.ReadFile(filename)
	if err != nil {
		fmt.Print(err)
	}
	file, err := os.Stat(filename)

	if err != nil {
		fmt.Println(err)
	}

	timestamp := file.ModTime()

	block := &Block{timestamp.Unix(), databytes, prevBlockHash, []byte{}, 0}
	return block
}
