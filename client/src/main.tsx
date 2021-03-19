import React, { useState, useEffect } from "react";
import { render } from "react-dom";
import axios from "axios";
import { BrowserRouter, Route } from "react-router-dom";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import DialogContent from "@material-ui/core/DialogContent";
import DeleteIcon from "@material-ui/icons/Delete";
import CodeIcon from "@material-ui/icons/Code";
import IconButton from "@material-ui/core/IconButton";
import ReplayIcon from "@material-ui/icons/Replay";
import PageviewIcon from "@material-ui/icons/Pageview";
import CssBaseline from "@material-ui/core/CssBaseline";
import ReactJson from "react-json-view";
import Popover from "@material-ui/core/Popover";
import {
  DataGrid,
  GridRowsProp,
  GridColDef,
  GridCellParams,
  GridColParams,
  ValueFormatterParams,
  GridSelectionModelChangeParams,
} from "@material-ui/data-grid";

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Route path="/" component={Index} />
      </BrowserRouter>
    );
  }
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
    },
    list: {
      "&$selected": {
        backgroundColor: "#4169e1",
        color: "white",
        "&:hover": {
          backgroundColor: "#4169e1",
        },
      },
      "&.focus": {},
      color: "#4169e1",
      border: "solid",
      borderRadius: 16,
    },
    appBar: {
      background: "#4169e1",
      zIndex: theme.zIndex.drawer + 1,
    },
    namespacesDrawer: {
      width: "10%",
      flexShrink: 0,
      padding: theme.spacing(1),
    },
    namespacesDrawerPaper: {
      width: "10%",
      padding: theme.spacing(1),
    },
    kindsDrawer: {
      left: "10%",
      width: "10%",
      flexShrink: 0,
      padding: theme.spacing(1),
    },
    kindsDrawerPaper: {
      left: "10%",
      width: "10%",
      padding: theme.spacing(1),
    },
    selected: {},
    cellTypography: {
      padding: theme.spacing(1),
      maxWidth: "300px",
      overflowWrap: "break-word",
    },
    entities: {
      flexGrow: 1,
      padding: theme.spacing(1),
    },
  })
);

function Index() {
  const classes = useStyles();
  const [namespaces, setNamespaces] = useState([] as any);
  const [namespace, setNamespace] = useState("");
  const [kinds, setKinds] = useState([] as any);
  const [kind, setKind] = useState("");
  const [entities, setEntities] = useState([] as any);
  const [properties, setProperties] = useState([] as any);
  const [viewOpen, setViewOpen] = useState(false);
  const [cellOpen, setCellOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [viewData, setViewData] = useState([] as any);
  const [cellData, setCellData] = useState("");
  const [selectedKeys, setSelectedKeys] = useState([] as any);
  const [selectedRowIds, setSelectedRowIds] = useState([] as any);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const Axios = axios.create({
    baseURL: "http://localhost:8080",
  });

  const selectNamespace = (namespace: string) => {
    setNamespace(namespace);

    const getKinds = async () => {
      await Axios.get(
        "/namespace/" + namespace
      )
        .then((res) => {
          setKinds(res.data.kinds);
          setProperties([]);
          setEntities([]);
        })
        .catch((error) => {
          setKinds([]);
        });
    };

    getKinds();
  };

  const selectKind = (kind: string) => {
    setKind(kind);
    setSelectedKeys([]);
    setSelectedRowIds([]);
    const entities: GridColDef[] = [];
    const properties: GridRowsProp = [];

    properties.push({
      field: "view",
      renderHeader: (params: GridColParams) => <PageviewIcon color="primary" />,
      renderCell: (params: GridCellParams) => (
        <IconButton onClick={() => handleRowOpen(params)}>
          <CodeIcon />
        </IconButton>
      ),
      width: 65,
      sortable: false,
      disableColumnMenu: true,
      disableClickEventBubbling: true,
    });

    const getProperties = async () => {
      await Axios.get(
          "/namespace/" +
          namespace +
          "/kind/" +
          kind +
          "/properties"
      )
        .then((res) => {
          res.data.properties.map((proprty: any) => {
            properties.push({
              field: proprty,
              headerName: proprty,
              width: 150,
              valueFormatter: (params: ValueFormatterParams) =>
                JSON.stringify(params.value),
            });
          });
          setProperties(properties);
        })
        .catch((error) => {
          setProperties([]);
        });
    };

    getProperties();

    const getEntities = async () => {
      await Axios.get(
          "/namespace/" +
          namespace +
          "/kind/" +
          kind
      )
        .then((res) => {
          res.data.entities.map((entity: any, index: number) => {
            entity.id = index + 1;
            entity.view = "";
            entities.push(entity);
          });
          setEntities(entities);
        })
        .catch((error) => {
          setEntities([]);
        });
    };

    getEntities();
  };

  useEffect(() => {
    const getNamespaces = async () => {
      await Axios.get("/namespaces")
        .then((res) => {
          setNamespaces(res.data.namespaces);
          selectNamespace(res.data.namespaces[0]);
        })
        .catch((error) => {
          setNamespaces([]);
        });
    };

    getNamespaces();
  }, []);



  const handleSelectKeyValues = (values: GridSelectionModelChangeParams) => {
    const keys: any[] = [];
    entities.map((entity: any) => {
      if (values.selectionModel.includes(String(entity.id))) {
        keys.push(entity["ID/Name"]);
      }
    });
    setSelectedKeys(keys);
    setSelectedRowIds(values.selectionModel);
  };

  const handleDeleteEntities = () => {
    const deleteEntities = async () => {
      await Axios.delete(
          "/namespace/" +
          namespace +
          "/kind/" +
          kind,
        { data: { keys: selectedKeys } }
      )
        .then((res) => {
          selectKind(kind);
        })
        .catch((error) => {});
    };

    deleteEntities();
    handleConfirmClose();
  };

  const handleConfirmOpen = () => {
    setConfirmOpen(true);
  };

  const handleRowOpen = (params: GridCellParams) => {
    const {id, view, ...row} = params.row;
    setViewData(row);
    setViewOpen(true);
  };

  const handleViewClose = () => {
    setViewOpen(false);
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
  };

  const handleCellClose = () => {
    setCellOpen(false);
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      {/* AppBar */}
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar><h3>Datastore</h3></Toolbar>
      </AppBar>

      {/* Namespaces */}
      <Drawer
        anchor="left"
        variant="permanent"
        classes={{
          paper: classes.namespacesDrawerPaper,
        }}
        className={classes.namespacesDrawer}
      >
        <Toolbar />
        <List>
          <ListItem>
            <ListItemText primary={"Namespaces"} />
          </ListItem>
          <Divider />
          {namespaces.map((n: any) => (
            <div>
              <br />
              <ListItem
                button
                onClick={() => selectNamespace(n)}
                selected={n == namespace}
                classes={{ root: classes.list, selected: classes.selected }}
                dense
              >
                <ListItemText primary={n} />
              </ListItem>
            </div>
          ))}
        </List>
      </Drawer>

      {/* Kinds */}
      <Drawer
        anchor="left"
        variant="permanent"
        classes={{
          paper: classes.kindsDrawerPaper,
        }}
        className={classes.kindsDrawer}
      >
        <Toolbar />
        <List>
          <ListItem>
            <ListItemText primary={"Kinds"} />
          </ListItem>
          <Divider />
          {kinds.map((k: any) => (
            <div>
              <br />
              <ListItem
                button
                onClick={() => selectKind(k)}
                selected={k == kind}
                classes={{ root: classes.list, selected: classes.selected }}
                dense
              >
                <ListItemText primary={k} />
              </ListItem>
            </div>
          ))}
        </List>
      </Drawer>

      {/* Entities */}
      <main className={classes.entities}>
        <Toolbar />
        <IconButton onClick={() => selectKind(kind)}>
          <ReplayIcon />
        </IconButton>
        <IconButton onClick={handleConfirmOpen}>
          <DeleteIcon />
        </IconButton>
        <DataGrid
          rows={entities}
          columns={properties}
          pageSize={200}
          checkboxSelection
          autoHeight
          onCellClick={(cell: GridCellParams) => {
            setCellData(JSON.stringify(cell?.getValue(cell?.field), null, 2));
            setAnchorEl(cell.element? cell.element :null);
            setCellOpen(true);
          }}
          onSelectionModelChange={(
            selectedIds: GridSelectionModelChangeParams
          ) => {
            handleSelectKeyValues(selectedIds);
          }}
          selectionModel={selectedRowIds}
          disableSelectionOnClick
        />
      </main>

      {/* Cell */}
      <Popover
        open={cellOpen}
        anchorEl={anchorEl}
        onClose={handleCellClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Typography className={classes.cellTypography}>{cellData}</Typography>
      </Popover>

      {/* Entity */}
      <Dialog onClose={handleViewClose} open={viewOpen}>
        <DialogTitle>Entity</DialogTitle>
        <DialogContent dividers>
          <ReactJson name={null} src={viewData} enableClipboard={false} />
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            variant="contained"
            onClick={handleViewClose}
            color="primary"
          >
            CLOSE
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm */}
      <Dialog onClose={handleConfirmClose} open={confirmOpen}>
        <DialogTitle>Delete</DialogTitle>
        <DialogContent dividers >
          Are you sure you want to delete these entities?
          {selectedKeys.map((key: any) => (
            <li>{key}</li>
          ))}
        </DialogContent>
        <DialogActions>
          <Button autoFocus variant="contained" onClick={handleConfirmClose}>
            CANCEL
          </Button>
          <Button
            autoFocus
            variant="contained"
            onClick={handleDeleteEntities}
            color="primary"
          >
            DELETE
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

render(<App />, document.querySelector("#app"));
