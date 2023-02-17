import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import web3 from './ethereum/web3';
import factory from './ethereum/factory';
import Auction from './ethereum/auction';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

// const Accounts = async () => {
//   const accounts = await web3.eth.getAccounts();
//   return accounts;
// }

const CreateAuction = () => {
  return (
    <Card sx={{ maxWidth: 640 }}>
      <CardContent>
        <Formik
          initialValues={{
            id: '002',
            name: 'NFT Picture',
            image: 'https://...',
            description: '',
          }}
          validationSchema={Yup.object().shape({
            id: Yup.string().max(255).required(),
            name: Yup.string().max(255).required(),
            image: Yup.string().max(255).required(),
            description: Yup.string().max(255),
          })}
          onSubmit={async (
            { id, name, image, description },
            { setErrors, setStatus, setSubmitting }
          ): Promise<void> => {
            try {
              const accounts = await web3.eth.getAccounts();
              const beneficiary = accounts[0];
              const secondsToEnd = '2592000';
              const lot = [id, name, image, description];
              const { to, transactionHash } = await factory.methods.createAuction(beneficiary, secondsToEnd, lot).send({
                from: beneficiary,
              });
            } catch (err) {
              alert(err.message);
              console.log(err);
              setStatus({ success: false });
              setSubmitting(false);
            }
          }}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }): JSX.Element => (
            <form noValidate onSubmit={handleSubmit}>
              <Typography variant="body2" color="text.secondary">
                New auction
              </Typography>
              <TextField
                error={Boolean(touched.id && errors.id)}
                helperText={touched.id && errors.id}
                value={values.id}
                label="ID"
                name="id"
                onBlur={handleBlur}
                onChange={handleChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />
              <TextField
                error={Boolean(touched.name && errors.name)}
                helperText={touched.name && errors.name}
                value={values.name}
                label="Name"
                name="name"
                onBlur={handleBlur}
                onChange={handleChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />
              <TextField
                error={Boolean(touched.image && errors.image)}
                helperText={touched.image && errors.image}
                value={values.image}
                label="Image url"
                name="image"
                onBlur={handleBlur}
                onChange={handleChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />
              <TextField
                error={Boolean(touched.description && errors.description)}
                helperText={touched.description && errors.description}
                value={values.description}
                label="Description"
                name="description"
                onBlur={handleBlur}
                onChange={handleChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />
              <Button color="primary" disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained">
                Create new auction
              </Button>
            </form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
};

function App() {
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    const fetchAuctions = async () => {
      const result = await factory.methods.getAuctions().call();
      console.log(result);
      setAuctions(result);

      for (const address of result) {
        const auction = Auction(address);
        const lot = await auction.methods.lot().call();
        console.log(lot)
      }
    };

    fetchAuctions();
  }, []);

  // console.log(web3.version);
  // web3.eth.getAccounts().then(console.log);
  // auction.methods.lastBid().call().then(console.log);

  return (
    <div>
      <Container maxWidth="sm">
        <CreateAuction />
        <br />
        <Card sx={{ maxWidth: 345 }}>
          <CardMedia
            sx={{ height: 140 }}
            image="/static/images/cards/contemplative-reptile.jpg"
            title="Contemplative Reptile"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              Lizard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all
              continents except Antarctica
            </Typography>
          </CardContent>
          <CardActions>
            <Button variant="contained" size="small">
              Share
            </Button>
            <Button size="small">Learn More</Button>
          </CardActions>
        </Card>
      </Container>
    </div>
  );
}

export default App;
