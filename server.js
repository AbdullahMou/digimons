require('dotenv').config();
const express = require('express');
const app = express()
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');
const PORT = process.env.PORT;
const API_DATA = process.env.API_DATA;
const client = new pg.Client(API_DATA);

//----------------------------------------------------


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

//----------------------------------------------------
app.get('/home', handleHome);
app.post('/fav', handleFav);
app.get('/favPage', fromDatabase);
app.get('/details/:id', handleDetails);
app.put('/details/:id', handleUpdate);
app.delete('/details/:id', handleDelete);


//----------------------------------------------------

function handleHome(req, res) {
    let url = `https://digimon-api.herokuapp.com/api/digimon`;
    superagent.get(url).then(data => {
        //        console.log(data.body);
        let digimonArr = data.body.map(val => new Digimon(val))
        res.render('home', { result: digimonArr })


    })

}
//----------------------------------------------------

function Digimon(val) {
    this.name = val.name;
    this.image = val.img;
    this.level = val.level;
}
//----------------------------------------------------
function handleFav(req, res) {
    let sql = `insert into digimon (name,image,level) values($1,$2,$3);`;
    let val = [req.body.name, req.body.image, req.body.level];
    client.query(sql, val).then(() => res.redirect('/favPage'))

}

function fromDatabase(req, res) {
    let sql = `select * from digimon ;`;
    client.query(sql).then(data => {
        res.render('fav', { result: data.rows })
    })
}


function handleDetails(req, res) {
    console.log(req.params.id);
    let sql = `select * from digimon where id=$1 ;`;
    let val = [req.params.id];
    client.query(sql, val).then(data => {
        console.log(data.rows);
        res.render('details', { result: data.rows })
    })
}

function handleUpdate(req, res) {
    let sql = `update digimon set name=$1,image=$2,level=$3 where id =$4 ;`;
    let val = [req.body.name, req.body.image, req.body.level, req.params.id];
    client.query(sql, val).then(() => res.redirect('/favPag'))

}

function handleDelete(req, res) {
    let sql = `delete from digimon where id=$1 ;`;
    let val = [req.params.id];
    client.query(sql, val).then(() => res.redirect('/favPag'))
}

//----------------------------------------------------

client.connect(() => {
    app.listen(PORT, () => console.log('lestining to ...', PORT));
})