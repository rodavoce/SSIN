package main

import (
	"bytes"
	"crypto/sha256"
	"encoding/gob"
	"log"
	"time"
)

// Block struct to  represent nodes in the BlockChain
type Block struct {
	Timestamp     int64          //Current timestamp
	Transactions  []*Transaction //Actual value information containing in the block
	PrevBlockHash []byte         //Stores the hash of the previous block
	Hash          []byte         //Hash of the block
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
func NewBlock(transactions []*Transaction, prevBlockHash []byte) *Block {
	block := &Block{time.Now().Unix(), transactions, prevBlockHash, []byte{}, 0}

	pow := NewProofOfWork(block)
	nonce, hash := pow.Run()

	block.Hash = hash[:]
	block.Nonce = nonce

	return block
}

//NewGenesisBlock create and return a genesis block
func NewGenesisBlock(coinbase *Transaction) *Block {
	return NewBlock([]*Transaction{coinbase}, []byte{})
}

func (b *Block) HashTransactions() []byte {
	var txHashes [][]byte
	var txHash [32]byte

	for _, tx := range b.Transactions {
		txHashes = append(txHashes, tx.ID)
	}
	txHash = sha256.Sum256(bytes.Join(txHashes, []byte{}))

	return txHash[:]
}

/*
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
*/
