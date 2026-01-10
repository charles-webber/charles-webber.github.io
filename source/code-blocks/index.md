---
title: 代码块展示
---

# 代码块展示这里是各种代码块的展示示例：

import torch
dict=['e','h','l','o']
x_data=[1,0,2,2,3]
x_data=torch.LongTensor([x_data])
y_data=torch.LongTensor([3,1,2,3,2])

class rnnmmodel(torch.nn.Module):
    def __init__(self,dictionary_size,num_class):
        super(rnnmmodel,self).__init__()
        self.hidden_size=8
        self.bedding_size=10
        self.dictionary_size=dictionary_size
        self.num_class=num_class
        self.embedding=torch.nn.Embedding(self.dictionary_size,self.bedding_size)
        self.rnn=torch.nn.RNN(input_size=self.bedding_size, hidden_size=self.hidden_size, num_layers=1, batch_first=True)
        self.Linear=torch.nn.Linear(self.hidden_size, self.num_class)
        
    def forward(self,x):
        h0=torch.zeros(1,x.size(0),self.hidden_size)
        x=self.embedding(x)
        x,_=self.rnn(x,h0)
        x=x.view(-1,self.hidden_size)
        x=self.Linear(x)
        return x

if __name__=='__main__':
    model=rnnmmodel(4,4)
    criterion=torch.nn.CrossEntropyLoss()
    optimizer=torch.optim.Adam(model.parameters(),lr=0.01)
    x_data=x_data.view(-1,5)
    y_data=y_data.view(-1)
    for epoch in range(15):
       y_hat=model(x_data)
       _,index=torch.max(y_hat,1)
       index=index.data.numpy()
       loss=criterion(y_hat,y_data)
       print('epoch:',epoch,'loss:',loss.item(),'guess:',''.join([dict[x] for x in index]))
       optimizer.zero_grad()
       loss.backward()
       optimizer.step()