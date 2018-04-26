package main

import (
	"bytes"
	"crypto/sha256"
	"strconv"
	"time"
	"io/ioutil"
	"fmt"
	"os"
)

// Block struct to  represent nodes in the BlockChain
type Block struct {
	Timestamp 	int64   //Current timestamp
	Data 		[]byte	//Actual value information containing in the block
	PrevBlockHash 	[]byte  //Stores the hash of the previous block
	Hash 		[]byte  //Hash of the block
}


// SetHash calculates and sets block hash
func (b *Block) SetHash() {
	timestamp := []byte(strconv.FormatInt(b.Timestamp, 10))
	headers := bytes.Join([][]byte{b.PrevBlockHash, b.Data, timestamp},[]byte {})
	hash:= sha256.Sum256(headers)
	b.Hash = hash[:]
}


// NewBlock creates and returns Block
func NewBlock(data string, prevBlockHash []byte) *Block {
	block := &Block{time.Now().Unix(), []byte(data), prevBlockHash, []byte{}}
	block.SetHash()
	return block
}


//NewGenesisBlock create and return a genesis block
func NewGenesisBlock() *Block {
	return NewBlock("First Block on Chain", []byte {})
}

func getBlockData(filename string, prevBlockHash []byte) *Block{
    databytes, err := ioutil.ReadFile(filename)
    if err != nil {
        fmt.Print(err)
	}
	file, err := os.Stat(filename)

    if err != nil {
        fmt.Println(err)
	}
	
	timestamp := file.ModTime()
	
	block := &Block{timestamp.Unix(), databytes, prevBlockHash, []byte{}}
	return block;
}